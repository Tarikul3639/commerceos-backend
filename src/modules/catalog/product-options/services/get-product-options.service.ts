import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto';

@Injectable()
export class GetProductOptionsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductOptionResponseDto[]> {
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

        return this.prisma.productOption.findMany({
            where: {
                productId: product.id,
            },
            include: {
                values: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}
