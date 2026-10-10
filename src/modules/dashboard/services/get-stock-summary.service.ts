import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { StockSummaryResponseDto } from '../dto/responses/stock-summary-response.dto';

@Injectable()
export class GetStockSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: DashboardQueryDto): Promise<StockSummaryResponseDto> {
    // Fetch product count and active inventory records in parallel.
    const [productCount, variants] = await Promise.all([
      this.prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prisma.productVariant.findMany({
        where: {
          deletedAt: null,
          product: {
            deletedAt: null,
          },
        },
        select: {
          stock: true,
          product: {
            select: {
              purchasePrice: true,
            },
          },
        },
      }),
    ]);

    // Calculate total inventory quantity and purchase-cost value.
    const totalStockQuantity = variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );

    const totalStockValue = variants.reduce(
      (sum, variant) =>
        sum + variant.stock * Number(variant.product.purchasePrice),
      0,
    );

    // Count variants with low stock or no stock.
    const lowStockCount = variants.filter(
      (variant) => variant.stock > 0 && variant.stock <= 5,
    ).length;

    const outOfStockCount = variants.filter(
      (variant) => variant.stock === 0,
    ).length;

    return {
      totalProducts: productCount,
      totalStockQuantity,
      totalStockValue: totalStockValue.toString(),
      lowStockCount,
      outOfStockCount,
    };
  }
}
