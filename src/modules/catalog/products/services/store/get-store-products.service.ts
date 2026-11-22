import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { ProductQueryDto } from '../../dto/requests/product-query.dto.js';
import {
  StoreProductListItemDto,
  StoreProductListResponseDto,
} from '../../dto/responses/store-product-list-response.dto.js';
import { buildStoreProductWhere } from '../../utils/product-query.util.js';

@Injectable()
export class GetStoreProductsService {
  constructor(private readonly prisma: PrismaService) { }

  private getActiveDiscount(
    discount: {
      isActive: boolean;
      startsAt: Date | null;
      endsAt: Date | null;
    } | null,
  ): boolean {
    if (!discount?.isActive) return false;
    const now = new Date();
    return (
      (!discount.startsAt || discount.startsAt <= now) &&
      (!discount.endsAt || discount.endsAt >= now)
    );
  }

  private calculateDiscountedPrice(
    sellingPrice: { toString(): string },
    discount: { type: string; value: { toString(): string } },
  ): string {
    const price = Number(sellingPrice.toString());
    const value = Number(discount.value.toString());
    const discounted =
      discount.type === 'PERCENTAGE'
        ? price - (price * value) / 100
        : price - value;
    return Math.max(0, discounted).toFixed(2);
  }

  private calculateDiscountPercentage(
    sellingPrice: { toString(): string },
    discount: { type: string; value: { toString(): string } },
  ): string {
    const price = Number(sellingPrice.toString());
    const value = Number(discount.value.toString());
    const percentage =
      discount.type === 'PERCENTAGE' ? value : (value / price) * 100;
    return percentage.toFixed(0);
  }

  async execute(query: ProductQueryDto): Promise<StoreProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 100);
    const skip = (page - 1) * limit;
    const where = buildStoreProductWhere(query);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          productDiscount: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const data: StoreProductListItemDto[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      subDescription: product.subDescription,
      sellingPrice: this.getActiveDiscount(product.productDiscount)
        ? this.calculateDiscountedPrice(
          product.sellingPrice,
          product.productDiscount!,
        )
        : product.sellingPrice.toString(),
      originalPrice: this.getActiveDiscount(product.productDiscount)
        ? product.sellingPrice.toString()
        : null,
      discountPercentage: this.getActiveDiscount(product.productDiscount)
        ? this.calculateDiscountPercentage(
          product.sellingPrice,
          product.productDiscount!,
        )
        : null,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt,
      images: product.images.map((image) => image.imageUrl),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
