import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../../../../lib/prisma/client.js';
import { PrismaService } from '../../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../../lib/prisma/client.js';

@Injectable()
export class DeleteProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Soft-delete only products without stock, cart references or order history.
   */
  async execute(
    productId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const product = await tx.product.findFirst({
            where: {
              id: productId,
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              subDescription: true,
              description: true,
              purchasePrice: true,
              sellingPrice: true,
              status: true,
              categoryId: true,
              brandId: true,
              sizeGuideId: true,
              deletedAt: true,
            },
          });

          if (!product) {
            throw new NotFoundException('Product not found');
          }

          const variantsWithStock = await tx.productVariant.count({
            where: {
              productId: product.id,
              stock: { gt: 0 },
            },
          });

          if (variantsWithStock > 0) {
            throw new BadRequestException(
              'Adjust all product variant stock to zero before deleting this product',
            );
          }

          const variantsWithRelations = await tx.productVariant.count({
            where: {
              productId: product.id,
              OR: [{ cartItems: { some: {} } }, { orderItems: { some: {} } }],
            },
          });

          if (variantsWithRelations > 0) {
            throw new BadRequestException(
              'Products referenced by carts or order history cannot be deleted; set the product to DRAFT instead',
            );
          }

          const deletedProduct = await tx.product.update({
            where: { id: product.id },
            data: { deletedAt: new Date() },
          });

          await this.createActivityLogService.execute(
            {
              type: ActivityType.DELETE,
              module: ActivityModule.PRODUCT,
              action: 'DELETE_PRODUCT',
              description: `Product "${product.name}" was deleted`,
              entityType: 'Product',
              entityId: product.id,
              userId,
              oldValue: {
                name: product.name,
                subDescription: product.subDescription,
                description: product.description,
                purchasePrice: product.purchasePrice,
                sellingPrice: product.sellingPrice,
                status: product.status,
                categoryId: product.categoryId,
                brandId: product.brandId,
                sizeGuideId: product.sizeGuideId,
                deletedAt: product.deletedAt,
              },
              newValue: {
                deletedAt: deletedProduct.deletedAt,
              },
            },
            tx,
          );

          return { message: 'Product deleted successfully' };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'Product usage changed while deleting. Please retry.',
        );
      }

      throw error;
    }
  }
}
