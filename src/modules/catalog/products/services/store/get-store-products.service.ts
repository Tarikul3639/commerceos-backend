import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { ProductQueryDto } from '../../dto/requests/product-query.dto.js';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto.js';
import { buildStoreProductWhere } from '../../utils/product-query.util.js';
import { mapStoreProductListItem } from '../../utils/store-product.mapper.js';

@Injectable()
export class GetStoreProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ProductQueryDto): Promise<StoreProductListResponseDto> {
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
          productDiscount: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map(mapStoreProductListItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
