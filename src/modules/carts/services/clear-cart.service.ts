import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ClearCartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(customerId: string): Promise<void> {
        const cart = await this.prisma.cart.findUnique({
            where: {
                customerId,
            },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
    }
}
