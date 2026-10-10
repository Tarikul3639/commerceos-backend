import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import { AdminProductListResponseDto } from '../../dto/responses/admin-product-list-response.dto';
import { normalizeProductQuery } from '../../utils/product-query.util';

@Injectable()
export class GetAdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ProductQueryDto): Promise<AdminProductListResponseDto> {
    const filters = normalizeProductQuery(query as Record<string, any>);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: {
          deletedAt: null,
          ...(filters.categoryId && { categoryId: filters.categoryId }),
          ...(filters.brandId && { brandId: filters.brandId }),
          ...(filters.status && { status: filters.status as any }),
          ...(filters.search && {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        sellingPrice: item.sellingPrice.toString(),
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
        hasNextPage: filters.page * filters.limit < total,
        hasPreviousPage: filters.page > 1,
      },
    };
  }
}
