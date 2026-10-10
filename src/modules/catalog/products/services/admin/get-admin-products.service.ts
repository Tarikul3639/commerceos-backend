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

    async execute(
        query: ProductQueryDto,
    ): Promise<AdminProductListResponseDto> {
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
            }),
            this.prisma.product.count({ where }),
        ]);

        const data: AdminProductListItemDto[] = products.map((product) => ({
            id: product.id,
            name: product.name,
            subDescription: product.subDescription,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
            status: product.status,
            categoryId: product.categoryId,
            brandId: product.brandId,
            sizeGuideId: product.sizeGuideId,
            deletedAt: product.deletedAt,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
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