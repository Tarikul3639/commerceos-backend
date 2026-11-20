import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { AddWishlistItemDto } from '../dto/requests/add-wishlist-item.dto.js';
import { WishlistResponseDto } from '../dto/responses/wishlist-response.dto.js';
import { getWishlistResponse } from './get-wishlist-response.js';

@Injectable()
export class AddWishlistItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    dto: AddWishlistItemDto,
  ): Promise<WishlistResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    if (!product)
      throw new NotFoundException('Product not found or unavailable');

    const wishlist = await this.prisma.wishlist.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      select: { id: true },
    });

    await this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      },
      update: {},
      create: { wishlistId: wishlist.id, productId: product.id },
    });

    return getWishlistResponse(this.prisma, customerId);
  }
}
