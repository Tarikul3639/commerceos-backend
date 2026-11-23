import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CartResponseDto } from '../dto/responses/cart-response.dto.js';
import { getCartResponse } from './get-cart-response.js';

@Injectable()
export class GetCartService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(customerId: string): Promise<CartResponseDto> {
    await this.prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
    });

    return getCartResponse(this.prisma, customerId);
  }
}
