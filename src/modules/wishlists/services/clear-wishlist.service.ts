import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class ClearWishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: { wishlist: { customerId } },
    });
  }
}
