import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateCartItemDto } from '../dto/requests/update-cart-item.dto';
import { CartResponseDto } from '../dto/responses/cart-response.dto';
import { getCartResponse } from './get-cart-response';

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
