import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CartResponseDto } from '../dto/responses/cart-response.dto';

@Injectable()
export class GetCartService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return {
      id: cart.id,
      customerId: cart.customerId,
      items: cart.items.map(({ product, ...item }) => ({
        ...item,
        product: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: product.sellingPrice.toString(),
          imageUrl: product.images[0]?.imageUrl ?? null,
        },
      })),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
