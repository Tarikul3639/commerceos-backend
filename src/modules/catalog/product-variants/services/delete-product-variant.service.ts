import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../infrastructure/database/generated/prisma/client.js';

import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

@Injectable()
export class DeleteProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Delete only unused zero-stock variants; referenced variants must be deactivated instead.
   */
  async execute(
    variantId: string,
    userId: string,
  ): Promise<ProductVariantResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: {
          id: variantId,
          deletedAt: null,
        },
        include: {
          options: {
            include: {
              option: true,
            },
          },
          cartItems: {
            select: { id: true },
          },
          orderItems: {
            select: { id: true },
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      if (variant.stock > 0) {
        throw new BadRequestException(
          'Adjust variant stock to zero before deleting this variant',
        );
      }

      if (variant.cartItems.length > 0 || variant.orderItems.length > 0) {
        throw new BadRequestException(
          'Variants referenced by carts or order history cannot be deleted; deactivate the variant instead',
        );
      }

      const oldValue = {
        productId: variant.productId,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        stock: variant.stock,
        isActive: variant.isActive,
        deletedAt: variant.deletedAt,
        options: variant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
      };

      await tx.productVariant.delete({
        where: { id: variant.id },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.PRODUCT,
          action: 'DELETE_PRODUCT_VARIANT',
          description: `Product variant "${variant.title ?? variant.sku}" was permanently deleted`,
          entityType: 'ProductVariant',
          entityId: variant.id,
          userId,
          oldValue,
          newValue: 'Variant permanently deleted',
        },
        tx,
      );

      return {
        id: variant.id,
        productId: variant.productId,
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        stock: variant.stock,
        isActive: false,
        deletedAt: null,
        createdAt: variant.createdAt,
        updatedAt: new Date(),
        options: [],
      };
    });
  }
}
