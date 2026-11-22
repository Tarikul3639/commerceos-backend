import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto.js';
import { getEffectiveProductPrice } from '../../utils/effective-product-price.util.js';

@Injectable()
export class GetStoreProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<StoreProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: 'PUBLISHED',
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        category: true,
        brand: true,
        sizeGuide: true,
        productDiscount: true,
        options: {
          include: {
            values: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        variants: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          include: {
            options: {
              include: {
                option: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const effectiveSellingPrice = getEffectiveProductPrice(
      product.sellingPrice,
      product.productDiscount,
    );
    const hasDiscount = effectiveSellingPrice.lessThan(product.sellingPrice);
    const discountPercentage = hasDiscount
      ? product.sellingPrice
          .minus(effectiveSellingPrice)
          .div(product.sellingPrice)
          .mul(100)
          .toFixed(0)
      : null;

    return {
      id: product.id,
      name: product.name,
      subDescription: product.subDescription,
      description: product.description,
      sellingPrice: effectiveSellingPrice.toString(),
      originalPrice: hasDiscount ? product.sellingPrice.toString() : null,
      discountPercentage,

      category: {
        id: product.category.id,
        name: product.category.name,
      },

      brand: product.brand
        ? {
            id: product.brand.id,
            name: product.brand.name,
          }
        : null,

      sizeGuide: product.sizeGuide,

      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        sortOrder: image.sortOrder,
      })),

      options: product.options.map((option) => ({
        id: option.id,
        name: option.name,
        type: option.type,
        values: option.values.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        })),
      })),

      variants: product.variants.map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku,
        stock: variant.stock,
        isAvailable: variant.stock > 0,
        options: variant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
      })),

      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
