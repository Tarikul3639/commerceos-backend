import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AddCartItemDto } from '../dto/requests/add-cart-item.dto';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class AddCartItemService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(customerId: string, dto: AddCartItemDto): Promise<CartResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, deletedAt: null, isActive: true },
            select: { id: true },
        });
        if (!product) throw new NotFoundException('Product not found or inactive');

        const cart = await this.prisma.cart.upsert({
            where: { customerId },
            update: {},
            create: { customerId },
        });
        await this.prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
            update: { quantity: { increment: dto.quantity } },
            create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
        });
        const updatedCart = await this.prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } } } },
        });
        if (!updatedCart) throw new BadRequestException('Failed to retrieve cart');
        return {
            id: updatedCart.id,
            customerId: updatedCart.customerId,
            items: updatedCart.items.map(({ product: itemProduct, ...item }) => ({
                ...item,
                product: {
                    id: itemProduct.id,
                    name: itemProduct.name,
                    sku: itemProduct.sku,
                    price: itemProduct.sellingPrice.toString(),
                    imageUrl: itemProduct.images[0]?.imageUrl ?? null,
                },
            })),
            createdAt: updatedCart.createdAt,
            updatedAt: updatedCart.updatedAt,
        };
    }
}
