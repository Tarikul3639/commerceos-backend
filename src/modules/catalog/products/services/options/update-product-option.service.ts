import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductOptionDto } from '../../dto/requests/options/update-product-option.dto';

@Injectable()
export class UpdateProductOptionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    productId: string,
    optionId: string,
    dto: UpdateProductOptionDto,
  ): Promise<void> {
    const option = await this.prisma.productOption.findFirst({
      where: { id: optionId, productId },
    });

    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    await this.prisma.productOption.update({
      where: { id: optionId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
      },
    });
  }
}
