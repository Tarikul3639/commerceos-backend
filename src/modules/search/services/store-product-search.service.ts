import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { mapStoreProductListItem } from '../../catalog/products/utils/store-product.mapper.js';
import { ProductSearchQueryDto } from '../dto/requests/product-search-query.dto.js';
import { ProductSearchResponseDto } from '../dto/responses/product-search-response.dto.js';

@Injectable()
export class StoreProductSearchService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(
    query: ProductSearchQueryDto,
  ): Promise<ProductSearchResponseDto> {
    const term = query.q.trim();

    if (term.length < 2) {
      return { data: [], total: 0 };
    }

    const contains = {
      contains: term,
      mode: 'insensitive' as const,
    };

    const where = {
      deletedAt: null,
      status: 'PUBLISHED' as const,
      OR: [
        { name: contains },
        { subDescription: contains },
        { description: contains },
        { category: { name: contains } },
        { brand: { name: contains } },
        {
          variants: {
            some: {
              sku: contains,
              isActive: true,
              deletedAt: null,
            },
          },
        },
      ],
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        take: 8,
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          productDiscount: true,
          variants: { select: { stock: true } },
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => ({
        ...mapStoreProductListItem(product),
        categoryName: product.category.name,
        brandName: product.brand?.name ?? null,
      })),
      total,
    };
  }
}
