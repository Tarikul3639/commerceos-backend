import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ProductQueryDto } from '../dto/requests/product-query.dto';
import { ProductListResponseDto } from '../dto/responses/product-list-response.dto';

/*
 * SERVICE: GetProductsService
 */

@Injectable()
export class GetProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: ProductQueryDto): Promise<ProductListResponseDto> {
        /*
         * Parse and sanitize pagination parameters
         */
        const {
            search,
            categoryId,
            brandId,
            isActive,
            page = '1',
            limit = '10',
        } = query;
        const currentPage = Math.max(Number(page), 1);
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        /*
         * Build database query filters
         */
        const where: Prisma.ProductWhereInput = {
            ...(search && {
                OR: [
                    { name: { contains: search.trim(), mode: 'insensitive' } },
                    { slug: { contains: search.trim(), mode: 'insensitive' } },
                    { sku: { contains: search.trim(), mode: 'insensitive' } },
                ],
            }),
            ...(categoryId && { categoryId }),
            ...(brandId && { brandId }),
            ...(isActive !== undefined && { isActive: isActive === 'true' }),
        };

        /*
         * Fetch paginated products and total record count concurrently
         */
        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    brand: {
                        select: { id: true, name: true, slug: true, website: true },
                    },
                    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                },
                orderBy: { createdAt: 'desc' },
                skip: (currentPage - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.product.count({ where }),
        ]);

        /*
         * Format response data and pagination metadata
         */
        return {
            data: products.map(
                ({
                    colors,
                    sizes,
                    purchasePrice,
                    sellingPrice,
                    images,
                    ...product
                }) => ({
                    ...product,
                    purchasePrice: purchasePrice.toString(),
                    sellingPrice: sellingPrice.toString(),
                    image: images[0]?.imageUrl ?? null,
                    colors,
                    sizes,
                    stock: product.stock,
                }),
            ),
            meta: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: currentPage * pageSize < total,
                hasPreviousPage: currentPage > 1,
            },
        } as ProductListResponseDto;
    }
}
