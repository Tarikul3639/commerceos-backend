import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';
import { GenerateProductVariantsDto } from '../dto/requests/generate-product-variants.dto.js';
import { ProductVariantResponseDto } from '../../product-variants/dto/responses/product-variant-response.dto.js';

@Injectable()
export class GenerateProductVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    productId: string,
    dto: GenerateProductVariantsDto,
    userId: string,
  ): Promise<ProductVariantResponseDto[]> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: { options: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.options.length === 0) {
      throw new BadRequestException(
        'Add product options before generating variants',
      );
    }
    if (dto.variants.length > 500) {
      throw new BadRequestException(
        'A maximum of 500 variants can be generated at once',
      );
    }

    const skus = dto.variants.map((variant) => variant.sku.trim());
    const barcodes = dto.variants.map((variant) => variant.barcode.trim());
    if (
      new Set(skus).size !== skus.length ||
      new Set(barcodes).size !== barcodes.length
    ) {
      throw new ConflictException('Generated SKUs and barcodes must be unique');
    }

    const existing = await this.prisma.productVariant.findMany({
      where: {
        OR: [{ sku: { in: skus } }, { barcode: { in: barcodes } }],
      },
      select: { sku: true, barcode: true },
    });
    if (existing.length > 0) {
      throw new ConflictException(
        'One or more generated SKUs or barcodes already exist. Regenerate identifiers and try again.',
      );
    }

    const optionValueIds = new Map(
      product.options.map((option) => [
        option.id,
        new Set(
          (option.values as Array<{ id: string }>).map((value) => value.id),
        ),
      ]),
    );
    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId: product.id, deletedAt: null },
      select: { options: true },
    });
    const combinationKeys = new Set<string>();

    for (const variant of dto.variants) {
      if (Object.keys(variant.options).length !== product.options.length) {
        throw new BadRequestException(
          'Each generated variant must select one value for every product option',
        );
      }
      for (const option of product.options) {
        if (!optionValueIds.get(option.id)?.has(variant.options[option.id])) {
          throw new BadRequestException(
            'Generated variant contains an invalid option value',
          );
        }
      }
      const combinationKey = product.options
        .map((option) => option.id + ':' + variant.options[option.id])
        .sort()
        .join('|');
      if (combinationKeys.has(combinationKey)) {
        throw new ConflictException(
          'Generated variants contain duplicate option combinations',
        );
      }
      combinationKeys.add(combinationKey);
      const alreadyExists = existingVariants.some((item) => {
        const selected = item.options as Record<string, string>;
        return product.options.every(
          (option) => selected[option.id] === variant.options[option.id],
        );
      });
      if (alreadyExists) {
        throw new ConflictException(
          'One or more option combinations already have variants',
        );
      }
    }

    const created = await this.prisma.$transaction(
      dto.variants.map((variant) =>
        this.prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku.trim(),
            barcode: variant.barcode.trim(),
            options: variant.options,
          },
        }),
      ),
    );

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'GENERATE_PRODUCT_VARIANTS',
      description: `${created.length} product variants were generated`,
      entityType: 'Product',
      entityId: product.id,
      userId,
      newValue: {
        variantIds: created.map((variant) => variant.id),
        count: created.length,
      },
    });

    return created as unknown as ProductVariantResponseDto[];
  }
}
