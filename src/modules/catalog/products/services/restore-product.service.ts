import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class RestoreProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<void> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: {
                    not: null,
                },
            },
            select: {
                id: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Deleted product not found');
        }

        await this.prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                deletedAt: null,
                isActive: true,
            },
        });
    }
}
