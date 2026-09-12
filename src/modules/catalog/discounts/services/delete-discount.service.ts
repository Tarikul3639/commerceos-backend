import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteDiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(discountId: string): Promise<void> {
        const discount = await this.prisma.discount.findFirst({
            where: {
                id: discountId,
                deletedAt: null,
            },

            select: {
                id: true,

                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        /**
         * If the discount has product assignments,
         * perform a soft delete.
         */
        if (discount._count.products > 0) {
            await this.prisma.discount.update({
                where: {
                    id: discountId,
                },

                data: {
                    isActive: false,
                    deletedAt: new Date(),
                },
            });

            return;
        }

        /**
         * Otherwise,
         * permanently delete the discount.
         */
        await this.prisma.discount.delete({
            where: {
                id: discountId,
            },
        });
    }
}
