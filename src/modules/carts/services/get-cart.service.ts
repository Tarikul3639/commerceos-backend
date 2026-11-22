import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getEffectiveProductPrice } from '../../catalog/products/utils/effective-product-price.util.js';

@Injectable()
export class GetCartService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                productDiscount: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.items.map(({ product, variant, ...item }) => ({
        ...item,
        variant: variant
          ? {
              id: variant.id,
              sku: variant.sku,
              colorName: null,
              colorHex: null,
              size: null,
            }
          : null,
        product: {
          id: product.id,
          name: product.name,
          price: getEffectiveProductPrice(
            product.sellingPrice,
            product.productDiscount,
          ).toString(),
          imageUrl: product.images[0]?.imageUrl ?? null,
        },
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
