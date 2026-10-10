import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductDto } from '../../dto/requests/update-product.dto';
import { ProductDetailResponseDto } from '../../dto/responses/product-detail-response.dto';

@Injectable()
export class UpdateProductService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const data: Prisma.ProductUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.subDescription !== undefined && { subDescription: dto.subDescription }),
      ...(dto.purchasePrice !== undefined && {
        purchasePrice: new Prisma.Decimal(dto.purchasePrice),
      }),
      ...(dto.sellingPrice !== undefined && {
        sellingPrice: new Prisma.Decimal(dto.sellingPrice),
      }),
      ...(dto.status && { status: dto.status }),
    };

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data,
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      subDescription: updated.subDescription,
      purchasePrice: updated.purchasePrice.toString(),
      sellingPrice: updated.sellingPrice.toString(),
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } as ProductDetailResponseDto;
  }
}
