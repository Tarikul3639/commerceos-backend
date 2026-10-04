import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { StockResponseDto } from '@/modules/inventory/stocks/dto/responses/stock-response.dto';

@Injectable()
export class GetStockService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(productId: string): Promise<StockResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id,
      productId: product.id,
      quantity: product.stock,
      sku: product.sku,
      productName: product.name,
      productImage: product.images[0]?.imageUrl ?? null,
      updatedAt: product.updatedAt,
    };
  }
}
