import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { StorefrontNewArrivalsQueryDto } from '../../dto/requests/storefront-new-arrivals-query.dto.js';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto.js';
import { mapStoreProductListItem } from '../../utils/store-product.mapper.js';

@Injectable()
export class GetStoreBestSellersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: StorefrontNewArrivalsQueryDto,
  ): Promise<StoreProductListResponseDto> {
    const limit = Math.min(query.limit ?? 8, 24);

    const sales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          paymentStatus: 'PAID',
          status: { not: 'CANCELLED' },
        },
        product: {
          status: 'PUBLISHED',
          deletedAt: null,
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    if (sales.length === 0) {
      return { data: [], total: 0, page: 1, limit, totalPages: 0 };
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: sales.map((sale) => sale.productId) },
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        productDiscount: true,
        variants: { select: { stock: true } },
      },
    });

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const orderedProducts = sales
      .map((sale) => productsById.get(sale.productId))
      .filter((product) => product !== undefined);

    return {
      data: orderedProducts.map(mapStoreProductListItem),
      total: orderedProducts.length,
      page: 1,
      limit,
      totalPages: orderedProducts.length > 0 ? 1 : 0,
    };
  }
}
