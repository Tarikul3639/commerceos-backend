import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

@Injectable()
export class GetProductVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<ProductVariantResponseDto[]> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    return (await this.prisma.productVariant.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
    })) as unknown as ProductVariantResponseDto[];
  }
}
