import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary';

@Injectable()
export class DeleteProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(productId: string): Promise<void> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: {
        id: true,
        images: {
          select: {
            publicId: true,
          },
        },
        discount: { select: { id: true } },
        purchaseItems: {
          select: {
            id: true,
          },
          take: 1,
        },
        cartItems: {
          select: {
            id: true,
          },
          take: 1,
        },
        orderItems: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const hasRelation =
      product.discount !== null ||
      product.purchaseItems.length > 0 ||
      product.cartItems.length > 0 ||
      product.orderItems.length > 0;

    if (hasRelation) {
      await this.prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return;
    }

    await this.prisma.product.delete({
      where: {
        id: productId,
      },
    });

    for (const image of product.images) {
      await this.cloudinaryService.delete(image.publicId);
    }
  }
}
