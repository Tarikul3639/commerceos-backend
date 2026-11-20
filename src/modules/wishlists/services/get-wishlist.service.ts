import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { WishlistResponseDto } from '../dto/responses/wishlist-response.dto.js';
import { getWishlistResponse } from './get-wishlist-response.js';

@Injectable()
export class GetWishlistService {
  constructor(private readonly prisma: PrismaService) {}

  execute(customerId: string): Promise<WishlistResponseDto> {
    return getWishlistResponse(this.prisma, customerId);
  }
}
