import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class DeleteProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(variantId: string): Promise<ProductVariantResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: {
          id: variantId,
        },
        include: {
          options: {
            include: {
              option: true,
            },
          },
          cartItems: {
            select: {
              id: true,
            },
          },
          orderItems: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
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

      const hasRelations =
        variant.cartItems.length > 0 || variant.orderItems.length > 0;

      if (!hasRelations) {
        await tx.productVariant.delete({
          where: {
            id: variant.id,
          },
        });

        await this.createActivityLogService.execute({
          type: ActivityType.DELETE,
          module: ActivityModule.PRODUCT,
          action: 'DELETE_PRODUCT_VARIANT',
          description: `Product variant "${variant.title ?? variant.sku}" was permanently deleted`,
          entityType: 'ProductVariant',
          entityId: variant.id,
          oldValue,
          newValue: "Variant permanently deleted",
        });

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
      }

      const deletedVariant = await tx.productVariant.update({
        where: {
          id: variant.id,
        },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
        include: {
          options: {
            include: {
              option: true,
            },
          },
        },
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.PRODUCT,
        action: 'SOFT_DELETE_PRODUCT_VARIANT',
        description: `Product variant "${variant.title ?? variant.sku}" was soft deleted`,
        entityType: 'ProductVariant',
        entityId: variant.id,
        oldValue,
        newValue: {
          isActive: deletedVariant.isActive,
          deletedAt: deletedVariant.deletedAt,
        },
      });

      return {
        id: deletedVariant.id,
        productId: deletedVariant.productId,
        title: deletedVariant.title,
        sku: deletedVariant.sku,
        barcode: deletedVariant.barcode,
        stock: deletedVariant.stock,
        isActive: deletedVariant.isActive,
        deletedAt: deletedVariant.deletedAt,
        createdAt: deletedVariant.createdAt,
        updatedAt: deletedVariant.updatedAt,
        options: deletedVariant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
      };
    });
  }
}