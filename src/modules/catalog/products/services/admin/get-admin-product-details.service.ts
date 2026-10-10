import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto';

@Injectable()
export class GetAdminProductDetailsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
    ): Promise<AdminProductDetailResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return {
            ...product,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
        };
    }
}