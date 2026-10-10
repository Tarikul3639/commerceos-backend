import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { LowStockProductItemDto } from '../dto/responses/low-stock-products-response.dto';

@Injectable()
export class GetLowStockProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: DashboardQueryDto): Promise<LowStockProductItemDto[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        deletedAt: null,
        stock: { lte: 5 },
        product: { deletedAt: null },
      },
      orderBy: { stock: 'asc' },
      take: 10,
      include: {
        product: {
          include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
        },
      },
    });
    return variants.map((variant) => ({
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      sku: variant.sku,
      productImage: variant.product.images[0]?.imageUrl ?? null,
      quantity: variant.stock,
    }));
  }
}
