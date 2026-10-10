import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductVariantDto } from '../../dto/requests/variants/update-product-variant.dto';

@Injectable()
export class UpdateProductVariantService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<void> {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }
}
