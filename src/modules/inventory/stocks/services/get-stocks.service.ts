import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { StockQueryDto } from '../dto/requests/stock-query.dto';
import { StockListResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class GetStocksService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: StockQueryDto): Promise<StockListResponseDto> {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,

      ...(query.search && {
        OR: [
          {
            name: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          },
          {
            sku: {
              contains: query.search.trim(),
              mode: 'insensitive',
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

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
            take: 1,
          },
        },
        orderBy: {
          stock: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map((product) => ({
        id: product.id,
        productId: product.id,
        quantity: product.stock,
        sku: product.sku,
        productName: product.name,
        productImage: product.images[0]?.imageUrl ?? null,
        updatedAt: product.updatedAt,
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
