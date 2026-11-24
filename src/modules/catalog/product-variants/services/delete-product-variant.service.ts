import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

@Injectable()
export class DeleteProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    variantId: string,
    userId: string,
  ): Promise<ProductVariantResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: variantId, deletedAt: null },
        include: {
          cartItems: { select: { id: true } },
          orderItems: { select: { id: true } },
        },
      });
      if (!variant) throw new NotFoundException('Product variant not found');

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

      await tx.productVariant.delete({ where: { id: variant.id } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.PRODUCT,
          action: 'DELETE_PRODUCT_VARIANT',
          description: `Product variant "${variant.sku}" was permanently deleted`,
          entityType: 'ProductVariant',
          entityId: variant.id,
          userId,
          oldValue: variant,
          newValue: 'Variant permanently deleted',
        },
        tx,
      );

      return {
        ...variant,
        isActive: false,
        deletedAt: null,
        updatedAt: new Date(),
      } as unknown as ProductVariantResponseDto;
    });
  }
}
