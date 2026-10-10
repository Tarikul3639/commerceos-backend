import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductDetailResponseDto } from '../../dto/responses/product-detail-response.dto';

@Injectable()
export class GetAdminProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<ProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true, website: true } },
        images: true,
        variants: true,
        discount: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      subDescription: product.subDescription,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    } as ProductDetailResponseDto;
  }
}
