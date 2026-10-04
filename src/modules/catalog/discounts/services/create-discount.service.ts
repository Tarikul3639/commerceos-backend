import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateDiscountDto } from '@/modules/catalog/discounts/dto/requests/create-discount.dto';
import { DiscountResponseDto } from '@/modules/catalog/discounts/dto/responses/discount-response.dto';

@Injectable()
export class CreateDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: CreateDiscountDto,
  ): Promise<DiscountResponseDto> {
    this.validateDates(dto.startDate, dto.endDate);

    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
      select: { id: true, discount: { select: { id: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.discount) {
      throw new ConflictException('Product already has a discount');
    }

    try {
      const discount = await this.prisma.discount.create({
        data: {
          productId: dto.productId,
          createdById: userId,
          value: new Prisma.Decimal(dto.value),
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        },
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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Product already has a discount');
      }
      throw error;
    }
  }

  private validateDates(startDate?: string | null, endDate?: string | null) {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException(
        'Discount end date must be on or after its start date',
      );
    }
  }
}
