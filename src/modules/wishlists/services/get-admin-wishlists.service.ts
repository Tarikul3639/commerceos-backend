import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { AdminWishlistQueryDto } from '../dto/requests/admin-wishlist-query.dto.js';
import { AdminWishlistsPaginatedResponseDto } from '../dto/responses/wishlist-response.dto.js';

@Injectable()
export class GetAdminWishlistsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: AdminWishlistQueryDto,
  ): Promise<AdminWishlistsPaginatedResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const where: Prisma.WishlistWhereInput = {
      items: { some: {} },
      ...(search
        ? {
            OR: [
              { customer: { name: { contains: search, mode: 'insensitive' } } },
              {
                customer: { email: { contains: search, mode: 'insensitive' } },
              },
              {
                customer: { phone: { contains: search, mode: 'insensitive' } },
              },
              {
                items: {
                  some: {
                    product: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [wishlists, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            orderBy: { createdAt: 'desc' },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sellingPrice: true,
                  status: true,
                  deletedAt: true,
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                    select: { imageUrl: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.wishlist.count({ where }),
    ]);

    const data = wishlists.map((wishlist) => ({
      id: wishlist.id,
      customerId: wishlist.customerId,
      customer: wishlist.customer,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
      itemCount: wishlist.items.length,
      items: wishlist.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.sellingPrice.toString(),
          imageUrl: item.product.images[0]?.imageUrl ?? null,
          isAvailable:
            item.product.status === 'PUBLISHED' &&
            item.product.deletedAt === null,
        },
      })),
    }));

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
