import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';
import { StoreCartStockDto } from '../../dto/requests/store-cart-stock.dto.js';
import { StoreCartStockResponseDto } from '../../dto/responses/store-cart-stock-response.dto.js';

@Injectable()
export class GetStoreCartStockService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: StoreCartStockDto): Promise<StoreCartStockResponseDto> {
    const productIds = [...new Set(query.items.map((item) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        deletedAt: null,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        variants: {
          where: { deletedAt: null, isActive: true },
          select: { id: true, stock: true },
        },
      },
    });

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    return {
      items: query.items.map(({ productId, variantId }) => {
        const product = productsById.get(productId);
        if (!product)
          return { productId, variantId: variantId ?? null, stock: 0 };

        if (variantId) {
          const variant = product.variants.find(
            (item) => item.id === variantId,
          );
          return { productId, variantId, stock: variant?.stock ?? 0 };
        }

        return {
          productId,
          variantId: null,
          stock: product.variants.reduce(
            (total, variant) => total + variant.stock,
            0,
          ),
        };
      }),
    };
  }
}
