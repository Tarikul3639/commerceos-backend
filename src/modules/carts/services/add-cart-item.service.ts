import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AddCartItemDto } from '../dto/requests/add-cart-item.dto';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class AddCartItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found or inactive');
    const variant = dto.variantId
      ? await this.prisma.productVariant.findFirst({
          where: {
            id: dto.variantId,
            productId: product.id,
            deletedAt: null,
            isActive: true,
          },
          select: { id: true },
        })
      : null;
    if (dto.variantId && !variant)
      throw new NotFoundException('Product variant not found or inactive');

    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
    });
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: variant?.id ?? null,
      },
    });
    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: dto.quantity } },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: variant?.id ?? null,
          quantity: dto.quantity,
        },
      });
    }
    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            },
            variant: true,
          },
        },
      },
    });
    if (!updatedCart) throw new BadRequestException('Failed to retrieve cart');
    return {
      id: updatedCart.id,
      customerId: updatedCart.customerId,
      items: updatedCart.items.map(
        ({ product: itemProduct, variant: itemVariant, ...item }) => ({
          ...item,
          variant: itemVariant
            ? {
                id: itemVariant.id,
                sku: itemVariant.sku,
                colorName: null,
                colorHex: null,
                size: null,
              }
            : null,
          product: {
            id: itemProduct.id,
            name: itemProduct.name,
            price: itemProduct.sellingPrice.toString(),
            imageUrl: itemProduct.images[0]?.imageUrl ?? null,
          },
        }),
      ),
      createdAt: updatedCart.createdAt,
      updatedAt: updatedCart.updatedAt,
    };
  }
}
