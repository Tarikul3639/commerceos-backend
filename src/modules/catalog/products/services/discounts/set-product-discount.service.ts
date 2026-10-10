import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

import { SetProductDiscountDto } from '../../dto/requests/discounts/set-product-discount.dto';
import { ProductDiscountResponseDto } from '../../dto/responses/product-discount-response.dto';

@Injectable()
export class SetProductDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    productId: string,
    dto: SetProductDiscountDto,
  ): Promise<ProductDiscountResponseDto> {
    const discount = await this.prisma.discount.upsert({
      where: { productId },
      update: {
        value: new Prisma.Decimal(dto.value),
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
      create: {
        productId,
        value: new Prisma.Decimal(dto.value),
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdById: 'system',
      },
    });

    return {
      id: discount.id,
      value: discount.value.toString(),
      startDate: discount.startDate,
      endDate: discount.endDate,
      createdById: discount.createdById,
    };
  }
}
