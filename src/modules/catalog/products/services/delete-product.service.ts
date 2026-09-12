import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<void> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },

            select: {
                id: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        /**
         * Soft delete the product.
         *
         * Products may have variants, inventory,
         * purchase history, stock movements,
         * cart items and order items.
         *
         * Therefore, hard deletion can cause
         * data integrity problems.
         */
        await this.prisma.$transaction(async (tx) => {
            /**
             * Soft delete product
             */
            await tx.product.update({
                where: {
                    id: productId,
                },

                data: {
                    deletedAt: new Date(),
                    isActive: false,
                },
            });

            /**
             * Soft delete all product variants
             *
             * This prevents variants from being
             * sold after the product is deleted.
             */
            await tx.productVariant.updateMany({
                where: {
                    productId,
                    deletedAt: null,
                },

                data: {
                    deletedAt: new Date(),
                    isActive: false,
                },
            });
        });
    }
}
