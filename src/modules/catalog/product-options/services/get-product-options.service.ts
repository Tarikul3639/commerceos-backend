import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto.js';

@Injectable()
export class GetProductOptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<ProductOptionResponseDto[]> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    return (await this.prisma.productOption.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
    })) as unknown as ProductOptionResponseDto[];
  }
}
