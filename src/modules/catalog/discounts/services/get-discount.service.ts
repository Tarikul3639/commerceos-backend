import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';

@Injectable()
export class GetDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(discountId: string): Promise<DiscountResponseDto> {
    const discount = await this.prisma.discount.findFirst({
      where: { id: discountId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
              select: { imageUrl: true },
            },
          },
        },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!discount) throw new NotFoundException('Discount not found');
    return {
      ...discount,
      value: discount.value.toString(),
      product: {
        id: discount.product.id,
        name: discount.product.name,
        sku: discount.product.sku,
        image: discount.product.images[0]?.imageUrl ?? null,
      },
    };
  }
}
