import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { AdminCartQueryDto } from '../dto/requests/admin-cart-query.dto.js';
import { AdminCartsPaginatedResponseDto } from '../dto/responses/admin-cart-response.dto.js';

@Injectable()
export class GetAdminCartsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: AdminCartQueryDto,
  ): Promise<AdminCartsPaginatedResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where: Prisma.CartWhereInput = {
      // Only carts with items are considered active shopping carts.
      items: { some: {} },
      ...(search && {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
          { customer: { phone: { contains: search, mode: 'insensitive' } } },
          {
            items: {
              some: {
                product: { name: { contains: search, mode: 'insensitive' } },
              },
            },
          },
        ],
      }),
    };

    const [carts, total] = await Promise.all([
      this.prisma.cart.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          customerId: true,
          createdAt: true,
          updatedAt: true,
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              quantity: true,
              productId: true,
              variantId: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  sellingPrice: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                    select: { imageUrl: true },
                  },
                },
              },
              variant: {
                select: { id: true, sku: true, title: true, stock: true },
              },
            },
          },
        },
      }),
      this.prisma.cart.count({ where }),
    ]);

    const data = carts.map((cart) => {
      const estimatedValue = cart.items.reduce(
        (totalValue, item) =>
          totalValue.add(item.product.sellingPrice.mul(item.quantity)),
        new Prisma.Decimal(0),
      );

      return {
        id: cart.id,
        customerId: cart.customerId,
        customer: cart.customer,
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          productId: item.productId,
          variantId: item.variantId,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.sellingPrice.toString(),
            imageUrl: item.product.images[0]?.imageUrl ?? null,
          },
          variant: item.variant,
        })),
        itemCount: cart.items.length,
        totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        estimatedValue: estimatedValue.toString(),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
