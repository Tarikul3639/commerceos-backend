import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class GetCartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(customerId: string): Promise<CartResponseDto> {
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

                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!cart) {
            const newCart = await this.prisma.cart.create({
                data: {
                    customerId,
                },

                include: {
                    items: {
                        include: {
                            variant: {
                                select: {
                                    id: true,
                                    sku: true,

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

            return {
                id: newCart.id,
                customerId: newCart.customerId,
                items: [],
                createdAt: newCart.createdAt,
                updatedAt: newCart.updatedAt,
            };
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
                    price: item.variant.sellingPrice.toString(),
                    imageUrl: item.variant.image,
                    product: item.variant.product,
                },
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            })),

            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
}
