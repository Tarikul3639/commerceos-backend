import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RestoreProductService {
    constructor(private readonly prisma: PrismaService) { }

    /** Restore a soft-deleted product. */
    async execute(productId: string): Promise<{ message: string }> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: { not: null },
            },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Deleted product not found');
        }

        await this.prisma.product.update({
            where: { id: product.id },
            data: {
                deletedAt: null,
            },
        });

        return { message: 'Product restored successfully' };
    }
}
