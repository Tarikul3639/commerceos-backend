import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteProductVariantService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string, variantId: string): Promise<void> {
        const variant = await this.prisma.productVariant.findFirst({
            where: {
                id: variantId,
                productId,
                deletedAt: null,
            },

            select: {
                id: true,
            },
        });

        if (!variant) {
            throw new NotFoundException('Product variant not found');
        }

        await this.prisma.productVariant.update({
            where: {
                id: variantId,
            },

            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });
    }
}
