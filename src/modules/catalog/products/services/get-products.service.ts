import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../../lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';

import { ProductQueryDto } from '../dto/requests/product-query.dto';
import { ProductListResponseDto } from '../dto/responses/product-list-response.dto'

@Injectable()
export class GetProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: ProductQueryDto,
    ): Promise<ProductListResponseDto> {
        const {
            search,
            categoryId,
            brandId,
            isActive,
            page = '1',
            limit = '10',
        } = query;

        // Minimum page 1
        const currentPage = Math.max(Number(page), 1);
        // Minimum limit 1 and Maximum 100
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        // Filter & Query
        const where: Prisma.ProductWhereInput = {
            deletedAt: null,

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search.trim(),
                            mode: 'insensitive'
                        }
                    },
                    {
                        slug: {
                            contains: search.trim(),
                            mode: 'insensitive'
                        }
                    },
                ]
            }),

            ...(categoryId && {
                categoryId,
            }),

            ...(brandId && {
                brandId,
            }),

            ...(isActive !== undefined && {
                isActive: isActive === 'true',
            }),
        };

        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    thumbnail: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,

                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    productVariants: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            inventories: {
                                select: {
                                    quantity: true,
                                },
                            },
                        },
                    },

                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },

                    _count: {
                        select: {
                            productVariants: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip: (currentPage - 1) * pageSize,

                take: pageSize,
            }),

            this.prisma.product.count({
                where,
            }),
        ]);

        return {
            data: products.map((product) => {
                const stock = product.productVariants.reduce(
                    (total, variant) =>
                        total +
                        variant.inventories.reduce(
                            (sum, inventory) => sum + inventory.quantity,
                            0,
                        ),
                    0,
                )

                return {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    thumbnail: product.thumbnail,
                    isActive: product.isActive,

                    category: product.category,
                    brand: product.brand,

                    variantCount: product._count.productVariants,
                    stock,

                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                }
            }),

            meta: {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: currentPage * pageSize < total,
                hasPreviousPage: currentPage > 1,
            },
        };
    }
}
