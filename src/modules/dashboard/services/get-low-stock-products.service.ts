import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { LowStockProductItemDto } from '../dto/responses/low-stock-products-response.dto';

@Injectable()
export class GetLowStockProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: DashboardQueryDto): Promise<LowStockProductItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 10,
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });
    return products.map((product) => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      productImage: product.images[0]?.imageUrl ?? null,
      quantity: product.stock,
    }));
  }
}
