import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { StockResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class GetStockService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(variantId: string): Promise<StockResponseDto> {
    // Fetch the variant with its product and primary image.
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deletedAt: null,
        product: {
          deletedAt: null,
        },
      },
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
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Map the variant and product details to the stock response DTO.
    return {
      id: variant.id,
      variantId: variant.id,
      productId: variant.productId,
      quantity: variant.stock,
      sku: variant.sku,
      productName: variant.product.name,
      productImage: variant.product.images[0]?.imageUrl ?? null,
      updatedAt: variant.updatedAt,
    };
  }
}
