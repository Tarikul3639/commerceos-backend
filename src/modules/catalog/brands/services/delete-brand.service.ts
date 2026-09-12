import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteBrandService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(brandId: string): Promise<void> {
        const brand = await this.prisma.brand.findFirst({
            where: {
                id: brandId,
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

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        /**
         * If the brand has associated products, 
         * perform a soft delete. 
         */
        if (brand._count.products > 0) {
            await this.prisma.brand.update({
                where: {
                    id: brandId,
                },

                data: {
                    deletedAt: new Date(),
                    isActive: false,
                },
            });

            return;
        }

        // If the brand has no associated products, we will perform a hard delete.
        await this.prisma.brand.delete({
            where: {
                id: brandId,
            },
        });
    }
}
