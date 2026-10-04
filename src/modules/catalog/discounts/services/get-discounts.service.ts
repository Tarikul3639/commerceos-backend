import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';

@Injectable()
export class GetDiscountsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: DiscountQueryDto,
  ): Promise<PaginatedResponse<DiscountResponseDto>> {
    const { search, page = '1', limit = '10' } = query;
    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const where = {
      ...(search && {
        OR: [
          {
            product: {
              name: { contains: search.trim(), mode: 'insensitive' as const },
            },
          },
          {
            product: {
              sku: { contains: search.trim(), mode: 'insensitive' as const },
            },
          },
        ],
      }),
    };
    const [discounts, total] = await this.prisma.$transaction([
      this.prisma.discount.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.discount.count({ where }),
    ]);
    return {
      data: discounts.map((discount) => ({
        ...discount,
        value: discount.value.toString(),
        product: {
          id: discount.product.id,
          name: discount.product.name,
          sku: discount.product.sku,
          image: discount.product.images[0]?.imageUrl ?? null,
        },
      })),
      meta: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: currentPage * pageSize < total,
        hasPreviousPage: currentPage > 1,
      },
    };
  }
}
