import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import {
    StoreProductListItemDto,
    StoreProductListResponseDto,
} from '../../dto/responses/store-product-list-response.dto';
import { buildStoreProductWhere } from '../../utils/product-query.util';

@Injectable()
export class GetStoreProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: ProductQueryDto,
    ): Promise<StoreProductListResponseDto> {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 10, 100);
        const skip = (page - 1) * limit;
        const where = buildStoreProductWhere(query);

        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        const data: StoreProductListItemDto[] = products.map((product) => ({
            id: product.id,
            name: product.name,
            subDescription: product.subDescription,
            sellingPrice: product.sellingPrice.toString(),
            categoryId: product.categoryId,
            brandId: product.brandId,
            createdAt: product.createdAt,
            images: product.images.map((image) => image.imageUrl),
        }));

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}