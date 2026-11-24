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

import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto.js';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

@Injectable()
export class CreateProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    dto: CreateProductVariantDto,
    userId: string,
  ): Promise<ProductVariantResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      include: { options: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku.trim() },
      select: { id: true },
    });
    if (existingSku) throw new ConflictException('SKU already exists');

    const barcode = dto.barcode?.trim() || null;
    if (barcode) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode },
        select: { id: true },
      });
      if (existingBarcode)
        throw new ConflictException('Barcode already exists');
    }

    this.validateOptions(product.options, dto.options);

    const productVariants = await this.prisma.productVariant.findMany({
      where: { productId: product.id, deletedAt: null },
      select: { options: true },
    });
    const duplicateCombination = productVariants.some(
      (item) => JSON.stringify(item.options) === JSON.stringify(dto.options),
    );
    if (duplicateCombination) {
      throw new ConflictException(
        'A variant with this option combination already exists',
      );
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: dto.sku.trim(),
        barcode,
        options: dto.options,
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'CREATE_PRODUCT_VARIANT',
      description: `Product variant "${variant.sku}" was created`,
      entityType: 'ProductVariant',
      entityId: variant.id,
      userId,
      newValue: variant,
    });

    return variant as unknown as ProductVariantResponseDto;
  }

  private validateOptions(
    productOptions: Array<{ id: string; values: unknown }>,
    selectedOptions: Record<string, string>,
  ): void {
    if (productOptions.length === 0) {
      if (Object.keys(selectedOptions).length > 0) {
        throw new BadRequestException(
          'This product does not have configurable options',
        );
      }
      return;
    }

    if (Object.keys(selectedOptions).length !== productOptions.length) {
      throw new BadRequestException(
        'Select exactly one value for every product option',
      );
    }

    for (const option of productOptions) {
      const selectedValueId = selectedOptions[option.id];
      const values = option.values as Array<{ id: string }>;
      if (
        !selectedValueId ||
        !values.some((value) => value.id === selectedValueId)
      ) {
        throw new BadRequestException(
          'One or more selected option values are invalid',
        );
      }
    }
  }
}
