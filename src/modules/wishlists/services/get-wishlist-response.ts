import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { WishlistResponseDto } from '../dto/responses/wishlist-response.dto.js';

export async function getWishlistResponse(
  prisma: PrismaService,
  customerId: string,
): Promise<WishlistResponseDto> {
  const wishlist = await prisma.wishlist.upsert({
    where: { customerId },
    update: {},
    create: { customerId },
    include: {
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
  });

  return {
    id: wishlist.id,
    customerId: wishlist.customerId,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
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
  };
}
