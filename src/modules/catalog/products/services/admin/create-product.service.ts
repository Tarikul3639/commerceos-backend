import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductDto } from '../../dto/requests/create-product.dto';
import { ProductDetailResponseDto } from '../../dto/responses/product-detail-response.dto';

@Injectable()
export class CreateProductService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: CreateProductDto,
  ): Promise<ProductDetailResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        subDescription: dto.subDescription ?? null,
        purchasePrice: new Prisma.Decimal(dto.purchasePrice),
        sellingPrice: new Prisma.Decimal(dto.sellingPrice),
        categoryId: dto.categoryId,
        brandId: dto.brandId ?? null,
        status: dto.status ?? 'DRAFT',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

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
