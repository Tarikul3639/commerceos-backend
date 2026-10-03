import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';

@Injectable()
export class UpdateDiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    discountId: string,
    dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    const current = await this.prisma.discount.findUnique({
      where: { id: discountId },
      select: {
        id: true,
        productId: true,
        startDate: true,
        endDate: true,
      },
    });
    if (!current) throw new NotFoundException('Discount not found');

    const productId = dto.productId ?? current.productId;
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true, discount: { select: { id: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.discount && product.discount.id !== current.id) {
      throw new ConflictException('Product already has a discount');
    }

    const startDate =
      dto.startDate === undefined
        ? current.startDate
        : dto.startDate
          ? new Date(dto.startDate)
          : null;
    const endDate =
      dto.endDate === undefined
        ? current.endDate
        : dto.endDate
          ? new Date(dto.endDate)
          : null;
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException(
        'Discount end date must be on or after its start date',
      );
    }

    try {
      const discount = await this.prisma.discount.update({
        where: { id: discountId },
        data: {
          ...(dto.productId !== undefined && { productId: dto.productId }),
          ...(dto.value !== undefined && {
            value: new Prisma.Decimal(dto.value),
          }),
          ...(dto.startDate !== undefined && {
            startDate: dto.startDate ? new Date(dto.startDate) : null,
          }),
          ...(dto.endDate !== undefined && {
            endDate: dto.endDate ? new Date(dto.endDate) : null,
          }),
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
}
