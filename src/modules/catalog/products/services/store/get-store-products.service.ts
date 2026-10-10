import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto';

@Injectable()
export class GetStoreProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ProductQueryDto): Promise<StoreProductListResponseDto> {
    const products = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        ...(query.categoryId && { categoryId: query.categoryId }),
      },
      orderBy: { createdAt: 'desc' },
      take: Number(query.limit ?? 10),
      skip: Number(query.page ?? 1) > 1 ? (Number(query.page ?? 1) - 1) * Number(query.limit ?? 10) : 0,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        sellingPrice: product.sellingPrice.toString(),
        imageUrl: product.images[0]?.imageUrl ?? null,
      })),
    };
  }
}
