import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { AddCartItemDto } from '../dto/requests/add-cart-item.dto.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getCartResponse } from './get-cart-response.js';

@Injectable()
export class AddCartItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    dto: AddCartItemDto,
  ): Promise<CartResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      select: {
        id: true,
        variants: {
          where: { deletedAt: null, isActive: true },
          select: { id: true, stock: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    const variant = dto.variantId
      ? product.variants.find((item) => item.id === dto.variantId)
      : null;

    if (dto.variantId && !variant) {
      throw new NotFoundException('Product variant not found or inactive');
    }

    const availableStock = variant
      ? variant.stock
      : product.variants.reduce((total, item) => total + item.stock, 0);

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

    const requestedTotal = (existingItem?.quantity ?? 0) + dto.quantity;

    if (requestedTotal > availableStock) {
      throw new BadRequestException(
        `Only ${availableStock} item(s) are currently available`,
      );
    }

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

    return getCartResponse(this.prisma, customerId);
  }
}
