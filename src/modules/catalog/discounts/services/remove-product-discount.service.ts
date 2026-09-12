import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class RemoveProductDiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(discountId: string, productId: string): Promise<void> {
        const productDiscount = await this.prisma.productDiscount.findFirst({
            where: {
                discountId,
                productId,
                deletedAt: null,
                isActive: true,
            },

            select: {
                id: true,
            },
        });

        if (!productDiscount) {
            throw new NotFoundException('Product discount assignment not found');
        }

        await this.prisma.productDiscount.update({
            where: {
                id: productDiscount.id,
            },

            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });
    }
}
