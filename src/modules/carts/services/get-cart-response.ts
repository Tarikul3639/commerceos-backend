import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getEffectiveProductPrice } from '../../catalog/products/utils/effective-product-price.util.js';

export async function getCartResponse(
  prisma: PrismaService,
  customerId: string,
): Promise<CartResponseDto> {
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              productDiscount: true,
              variants: {
                where: { deletedAt: null, isActive: true },
                select: { stock: true },
              },
            },
          },
          variant: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    throw new NotFoundException('Cart not found');
  }

  return {
    id: cart.id,
    customerId: cart.customerId,
    items: cart.items.map(({ product, variant, ...item }) => ({
      ...item,
      // Variant lines use their own stock; non-variant lines use aggregate product stock.
      stock:
        variant?.stock ??
        product.variants.reduce(
          (total, productVariant) => total + productVariant.stock,
          0,
        ),
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            stock: variant.stock,
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
