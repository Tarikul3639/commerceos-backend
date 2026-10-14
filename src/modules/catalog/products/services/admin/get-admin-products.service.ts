import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import {
    AdminProductListItemDto,
    AdminProductListResponseDto,
} from '../../dto/responses/admin-product-list-response.dto';
import { buildAdminProductWhere } from '../../utils/product-query.util';

@Injectable()
export class GetAdminProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: ProductQueryDto): Promise<AdminProductListResponseDto> {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 10, 100);
        const skip = (page - 1) * limit;
        const where = buildAdminProductWhere(query);

        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: {
                        select: {
                            imageUrl: true,
                            sortOrder: true,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                        take: 1,
                    },
                    category: {
                        select: { id: true, name: true },
                    },
                    brand: {
                        select: { id: true, name: true },
                    },
                    sizeGuide: {
                        select: { id: true, name: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        const data: AdminProductListItemDto[] = products.map((product) => ({
            id: product.id,
            name: product.name,
            image: product.images[0]?.imageUrl ?? null,
            subDescription: product.subDescription,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
            status: product.status,
            category: {
                id: product.category.id,
                name: product.category.name,
            },
            brand: product.brand
                ? {
                    id: product.brand.id,
                    name: product.brand.name,
                }
                : null,
            sizeGuide: product.sizeGuide
                ? {
                    id: product.sizeGuide.id,
                    name: product.sizeGuide.name,
                }
                : null,
            deletedAt: product.deletedAt,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }
}
