import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { UpdateCartItemDto } from '../dto/requests/update-cart-item.dto.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getCartResponse } from './get-cart-response.js';

@Injectable()
export class UpdateCartItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cart: { customerId } },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });
    return getCartResponse(this.prisma, customerId);
  }
}
