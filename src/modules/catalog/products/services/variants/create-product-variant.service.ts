import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductVariantDto } from '../../dto/requests/variants/create-product-variant.dto';

@Injectable()
export class CreateProductVariantService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string, dto: CreateProductVariantDto): Promise<void> {
    const data = {
      productId,
      title: dto.title ?? null,
      sku: dto.sku,
      barcode: dto.barcode ?? null,
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
    };

    await this.prisma.productVariant.create({ data });
  }
}
