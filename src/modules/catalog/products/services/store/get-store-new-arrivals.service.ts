import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';
import type { Prisma } from '../../../../../infrastructure/database/generated/prisma/client.js';

import { StorefrontNewArrivalsQueryDto } from '../../dto/requests/storefront-new-arrivals-query.dto.js';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto.js';
import { mapStoreProductListItem } from '../../utils/store-product.mapper.js';

@Injectable()
export class GetStoreNewArrivalsService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(
    query: StorefrontNewArrivalsQueryDto,
  ): Promise<StoreProductListResponseDto> {
    const limit = query.limit ?? 8;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: 'PUBLISHED' as const,
      isFeatured: false,
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          productDiscount: true,
          variants: { select: { stock: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(mapStoreProductListItem),
      total,
      page: 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
