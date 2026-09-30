import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class RemoveCartItemService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        customerId: string,
        cartItemId: string,
    ): Promise<CartResponseDto> {
        const cartItem = await this.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,

                cart: {
                    customerId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prisma.cartItem.delete({
            where: {
                id: cartItemId,
            },
        });

        const cart = await this.prisma.cart.findUnique({
            where: {
                customerId,
            },

            include: {
                items: {
                    include: {
                        variant: {
                            select: {
                                id: true,
                                sku: true,
                                image: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        sellingPrice: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        return {
            id: cart.id,
            customerId: cart.customerId,

            items: cart.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                variantId: item.variantId,
                variant: {
                    id: item.variant.id,
                    sku: item.variant.sku,
                    price: item.variant.product.sellingPrice.toString(),
                    imageUrl: item.variant.image,
                    product: {
                        id: item.variant.product.id,
                        name: item.variant.product.name,
                        slug: item.variant.product.slug,
                    },
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
}
