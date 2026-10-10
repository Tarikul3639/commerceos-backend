import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class RemoveProductDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<void> {
    await this.prisma.discount.delete({
      where: { productId },
    });
  }
}
