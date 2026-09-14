import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { AddCartItemDto } from '../dto/requests/add-cart-item.dto';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class AddCartItemService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        customerId: string,
        addCartItemDto: AddCartItemDto,
    ): Promise<CartResponseDto> {
        const { variantId, quantity } = addCartItemDto;

        const customer = await this.prisma.customer.findUnique({
            where: {
                id: customerId,
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const variant = await this.prisma.productVariant.findFirst({
            where: {
                id: variantId,

                deletedAt: null,
            },
        });

        if (!variant) {
            throw new NotFoundException('Product variant not found');
        }

        const cart = await this.prisma.cart.upsert({
            where: {
                customerId,
            },

            update: {},

            create: {
                customerId,
            },
        });

        const existingCartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });

        if (existingCartItem) {
            await this.prisma.cartItem.update({
                where: {
                    id: existingCartItem.id,
                },

                data: {
                    quantity: {
                        increment: quantity,
                    },
                },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity,
                },
            });
        }

        const updatedCart = await this.prisma.cart.findUnique({
            where: {
                id: cart.id,
            },

            include: {
                items: {
                    include: {
                        variant: {
                            select: {
                                id: true,
                                sku: true,
                                image: true,
                                sellingPrice: true,
                                
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!updatedCart) {
            throw new BadRequestException('Failed to retrieve cart');
        }

        return {
            id: updatedCart.id,
            customerId: updatedCart.customerId,

            items: updatedCart.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                variantId: item.variantId,
                variant: {
                    id: item.variant.id,
                    sku: item.variant.sku,
                    price: item.variant.sellingPrice.toString(),
                    imageUrl: item.variant.image,
                    product: item.variant.product,
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdAt: updatedCart.createdAt,
            updatedAt: updatedCart.updatedAt,
        };
    }
}
