import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

export async function getCartResponse(prisma: PrismaService, customerId: string): Promise<CartResponseDto> {
    const cart = await prisma.cart.findUnique({
        where: { customerId },
        include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } }, orderBy: { createdAt: 'desc' } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return {
        id: cart.id,
        customerId: cart.customerId,
        items: cart.items.map(({ product, ...item }) => ({
            ...item,
            product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: product.sellingPrice.toString(),
                imageUrl: product.images[0]?.imageUrl ?? null,
            },
        })),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
    };
}
