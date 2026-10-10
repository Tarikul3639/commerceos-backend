import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class DeleteProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<{ message: string }> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.prisma.product.update({
            where: { id: product.id },
            data: {
                deletedAt: new Date(),
            },
        });

        return { message: 'Product deleted successfully' };
    }
}
