import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(discountId: string): Promise<void> {
    const result = await this.prisma.discount.deleteMany({
      where: { id: discountId },
    });
    if (result.count === 0) throw new NotFoundException('Discount not found');
  }
}
