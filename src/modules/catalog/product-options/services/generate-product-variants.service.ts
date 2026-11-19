import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../lib/prisma/client.js';

import { ProductVariantResponseDto } from '../../product-variants/dto/responses/product-variant-response.dto.js';

@Injectable()
export class GenerateProductVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    productId: string,
    userId: string,
  ): Promise<ProductVariantResponseDto[]> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const options = await this.prisma.productOption.findMany({
      where: { productId: product.id },
      include: {
        values: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (
      options.length === 0 ||
      options.some((option) => option.values.length === 0)
    ) {
      throw new BadRequestException(
        'Every product option must have at least one value',
      );
    }

    // Cap combinations to prevent a single request from generating unbounded records.
    const combinationCount = options.reduce(
      (count, option) => count * option.values.length,
      1,
    );

    if (!Number.isSafeInteger(combinationCount) || combinationCount > 500) {
      throw new BadRequestException(
        'Product options exceed the 500-variant generation limit',
      );
    }

    // Generate every possible combination.
    const combinations = options.reduce<
      Array<(typeof options)[number]['values']>
    >(
      (current, option) =>
        current.flatMap((combination) =>
          option.values.map((value) => [...combination, value]),
        ),
      [[]],
    );

    const variants: ProductVariantResponseDto[] = [];

    for (const combination of combinations) {
      const optionValueIds = combination.map((value) => value.id);

      // Use option value IDs to avoid SKU collisions between combinations.
      const sku = `${product.id.slice(0, 8)}-${optionValueIds
        .map((id) => id.slice(0, 8))
        .join('-')}`.toUpperCase();

      // Skip an existing variant with the same SKU.
      const existingVariant = await this.prisma.productVariant.findUnique({
        where: { sku },
        select: { id: true },
      });

      if (existingVariant) {
        continue;
      }

      const variant = await this.prisma.productVariant.create({
        data: {
          productId: product.id,
          title: combination.map((value) => value.value).join(' / '),
          sku,
          stock: 0,
          options: {
            connect: optionValueIds.map((id) => ({ id })),
          },
        },
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      variants.push({
        id: variant.id,
        productId: variant.productId,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        stock: variant.stock,
        options: variant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
        isActive: variant.isActive,
        deletedAt: variant.deletedAt,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      });
    }

    if (variants.length > 0) {
      await this.createActivityLogService.execute({
        type: ActivityType.CREATE,
        module: ActivityModule.PRODUCT,
        action: 'GENERATE_PRODUCT_VARIANTS',
        description: `${variants.length} product variants were generated`,
        entityType: 'Product',
        entityId: product.id,
        userId,
        newValue: {
          variantIds: variants.map((variant) => variant.id),
          count: variants.length,
        },
      });
    }

    return variants;
  }
}
