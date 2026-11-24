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

import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto.js';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

@Injectable()
export class UpdateProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    variantId: string,
    dto: UpdateProductVariantDto,
    userId: string,
  ): Promise<ProductVariantResponseDto> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null },
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    if (dto.sku !== undefined && dto.sku.trim() !== variant.sku) {
      const duplicate = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku.trim() },
        select: { id: true },
      });
      if (duplicate) throw new ConflictException('SKU already exists');
    }

    const barcode =
      dto.barcode === undefined ? undefined : dto.barcode?.trim() || null;
    if (barcode && barcode !== variant.barcode) {
      const duplicate = await this.prisma.productVariant.findUnique({
        where: { barcode },
        select: { id: true },
      });
      if (duplicate) throw new ConflictException('Barcode already exists');
    }

    if (dto.options !== undefined) {
      const productOptions = await this.prisma.productOption.findMany({
        where: { productId: variant.productId },
      });
      this.validateOptions(productOptions, dto.options);

      const existingVariants = await this.prisma.productVariant.findMany({
        where: {
          productId: variant.productId,
          id: { not: variant.id },
          deletedAt: null,
        },
        select: { options: true },
      });
      if (
        existingVariants.some(
          (item) =>
            JSON.stringify(item.options) === JSON.stringify(dto.options),
        )
      ) {
        throw new ConflictException(
          'A variant with this option combination already exists',
        );
      }
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        ...(dto.sku !== undefined && { sku: dto.sku.trim() }),
        ...(barcode !== undefined && { barcode }),
        ...(dto.options !== undefined && { options: dto.options }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT_VARIANT',
      description: `Product variant "${updated.sku}" was updated`,
      entityType: 'ProductVariant',
      entityId: updated.id,
      userId,
      oldValue: variant,
      newValue: updated,
    });

    return updated as unknown as ProductVariantResponseDto;
  }

  private validateOptions(
    productOptions: Array<{ id: string; values: unknown }>,
    selectedOptions: Record<string, string>,
  ): void {
    if (Object.keys(selectedOptions).length !== productOptions.length) {
      throw new BadRequestException(
        'Select exactly one value for every product option',
      );
    }
    for (const option of productOptions) {
      const values = option.values as Array<{ id: string }>;
      if (!values.some((value) => value.id === selectedOptions[option.id])) {
        throw new BadRequestException(
          'One or more selected option values are invalid',
        );
      }
    }
  }
}
