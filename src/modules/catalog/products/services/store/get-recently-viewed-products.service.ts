import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { RecentlyViewedProductsDto } from '../../dto/requests/recently-viewed-products.dto.js';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto.js';
import { mapStoreProductListItem } from '../../utils/store-product.mapper.js';

@Injectable()
export class GetRecentlyViewedProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: RecentlyViewedProductsDto,
  ): Promise<StoreProductListResponseDto> {
    const productIds = query.productIds.slice(0, 20);

    if (productIds.length === 0) {
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
        status: 'PUBLISHED',
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
    const orderedProducts = productIds.flatMap((id) => {
      const product = productsById.get(id);
      return product ? [mapStoreProductListItem(product)] : [];
    });

    return {
      data: orderedProducts,
      total: orderedProducts.length,
      page: 1,
      limit: 20,
      totalPages: orderedProducts.length > 0 ? 1 : 0,
    };
  }
}
