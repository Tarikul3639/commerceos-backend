import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';

@Injectable()
export class GetProductImagesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductImageResponseDto[]> {
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

        return this.prisma.productImage.findMany({
            where: {
                productId: product.id,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    }
}
