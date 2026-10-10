import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto';

@Injectable()
export class GetStoreProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<StoreProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'PUBLISHED' },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sellingPrice: product.sellingPrice.toString(),
      images: product.images.map((image) => image.imageUrl),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
