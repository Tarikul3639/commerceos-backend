import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductDiscountResponseDto } from '../../dto/responses/product-discount-response.dto';

@Injectable()
export class GetProductDiscountService {
  constructor(private readonly prisma: PrismaService) { }

  async execute(productId: string): Promise<ProductDiscountResponseDto | null> {
    const discount = await this.prisma.discount.findUnique({
      where: { productId },
    });

    if (!discount) {
      return null;
    }

    return {
      id: discount.id,
      value: discount.value.toString(),
      startDate: discount.startDate,
      endDate: discount.endDate,
      createdById: discount.createdById,
    };
  }
}
