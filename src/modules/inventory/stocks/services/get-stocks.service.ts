import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { StockQueryDto } from '../dto/requests/stock-query.dto';
import { StockListResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class GetStocksService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: StockQueryDto): Promise<StockListResponseDto> {
    // Normalize pagination values and enforce the maximum page size.
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    // Build filters for active variants, product search, and low stock.
    const search = query.search?.trim();

    const where: Prisma.ProductVariantWhereInput = {
      deletedAt: null,
      product: {
        deletedAt: null,
      },
      ...(search && {
        OR: [
          {
            sku: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            product: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
      ...(query.lowStock === 'true' && {
        stock: {
          lte: 5,
        },
      }),
    };

    // Fetch paginated variants and the total count in one transaction.
    const [variants, total] = await this.prisma.$transaction([
      this.prisma.productVariant.findMany({
        where,
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  sortOrder: 'asc',
                },
                take: 1,
              },
            },
          },
        },
        orderBy: [
          {
            stock: 'asc',
          },
          {
            id: 'asc',
          },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.productVariant.count({
        where,
      }),
    ]);

    // Calculate pagination metadata.
    const totalPages = Math.ceil(total / limit);

    return {
      data: variants.map((variant) => ({
        id: variant.id,
        variantId: variant.id,
        productId: variant.productId,
        quantity: variant.stock,
        sku: variant.sku,
        productName: variant.product.name,
        productImage: variant.product.images[0]?.imageUrl ?? null,
        updatedAt: variant.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
