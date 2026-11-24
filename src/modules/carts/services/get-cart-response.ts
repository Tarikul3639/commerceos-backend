import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getEffectiveProductPrice } from '../../catalog/products/utils/effective-product-price.util.js';

type OptionValue = { id: string; label: string; colorCode?: string };

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
              options: { orderBy: { sortOrder: 'asc' } },
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

  if (!cart) throw new NotFoundException('Cart not found');

  return {
    id: cart.id,
    customerId: cart.customerId,
    items: cart.items.map(({ product, variant, ...item }) => {
      const selected = variant?.options as Record<string, string> | undefined;
      const selectedValues = product.options.flatMap((option) => {
        const value = (option.values as OptionValue[]).find(
          (item) => item.id === selected?.[option.id],
        );
        return value ? [{ option, value }] : [];
      });
      const color = selectedValues.find(
        ({ option }) => option.type === 'COLOR',
      );
      const size = selectedValues.find(({ option }) => option.type === 'SIZE');

      return {
        ...item,
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
              colorName: color?.value.label ?? null,
              colorHex: color?.value.colorCode ?? null,
              size: size?.value.label ?? null,
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
      };
    }),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}
