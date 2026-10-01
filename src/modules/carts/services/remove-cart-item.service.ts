import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CartResponseDto } from '../dto/responses/cart-response.dto';
import { getCartResponse } from './get-cart-response';

@Injectable()
export class RemoveCartItemService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(customerId: string, cartItemId: string): Promise<CartResponseDto> {
        const item = await this.prisma.cartItem.findFirst({ where: { id: cartItemId, cart: { customerId } } });
        if (!item) throw new NotFoundException('Cart item not found');
        await this.prisma.cartItem.delete({ where: { id: cartItemId } });
        return getCartResponse(this.prisma, customerId);
    }
}
