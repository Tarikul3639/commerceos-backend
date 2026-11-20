import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { WishlistResponseDto } from '../dto/responses/wishlist-response.dto.js';
import { getWishlistResponse } from './get-wishlist-response.js';

@Injectable()
export class RemoveWishlistItemService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    productId: string,
  ): Promise<WishlistResponseDto> {
    const result = await this.prisma.wishlistItem.deleteMany({
      where: { productId, wishlist: { customerId } },
    });
    if (result.count === 0)
      throw new NotFoundException('Wishlist item not found');
    return getWishlistResponse(this.prisma, customerId);
  }
}
