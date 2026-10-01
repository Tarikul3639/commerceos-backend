import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ProductDetailResponseDto } from '../dto/responses/product-detail-response.dto';

/*
 * SERVICE: GetProductService
 */

@Injectable()
export class GetProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductDetailResponseDto> {
        /*
         * Fetch product details with relations
         */
        const product = await this.prisma.product.findFirst({
            where: { id: productId, deletedAt: null },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                brand: {
                    select: { id: true, name: true, slug: true, website: true },
                },
                images: { orderBy: { sortOrder: 'asc' } },
                discounts: {
                    where: { isActive: true, deletedAt: null },
                    include: { discount: true },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        /*
         * Format price fields and return response payload
         */
        return {
            ...product,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
        } as unknown as ProductDetailResponseDto;
    }
}
