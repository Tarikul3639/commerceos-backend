import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class DeleteProductOptionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string, optionId: string): Promise<void> {
    const option = await this.prisma.productOption.findFirst({
      where: { id: optionId, productId },
    });

    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    await this.prisma.productOption.delete({ where: { id: optionId } });
  }
}
