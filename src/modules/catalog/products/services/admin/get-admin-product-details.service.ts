import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';

import {
  AdminProductDetailResponseDto,
  AdminProductImageDto,
  AdminProductOptionDto,
  AdminProductOptionValueDto,
  AdminProductRelationDto,
  AdminProductSizeGuideDto,
  AdminProductVariantDto,
  AdminProductVariantOptionDto,
} from '../../dto/responses/admin-product-detail-response.dto.js';

/**
 * Retrieves complete admin product details.
 */
@Injectable()
export class GetAdminProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<AdminProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },

        brand: {
          select: {
            id: true,
            name: true,
          },
        },

        sizeGuide: true,
        productDiscount: true,

        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        options: {
          include: {
            values: true,
          },
        },

        variants: {
          where: {
            deletedAt: null,
          },
          include: {
            options: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Category DTO mapping.
    const category: AdminProductRelationDto = {
      id: product.category.id,
      name: product.category.name,
    };

    // Brand DTO mapping.
    const brand: AdminProductRelationDto | null = product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
        }
      : null;

    // Size guide DTO mapping.
    const sizeGuide: AdminProductSizeGuideDto | null = product.sizeGuide
      ? {
          id: product.sizeGuide.id,
          name: product.sizeGuide.name,
          description: product.sizeGuide.description,
          unit: product.sizeGuide.unit,
          columns: product.sizeGuide.columns as string[],
          rows: product.sizeGuide.rows as Record<string, string | number>[],
        }
      : null;

    // Product image DTO mapping.
    const images: AdminProductImageDto[] = product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      sortOrder: image.sortOrder,
    }));

    // Product option DTO mapping.
    const options: AdminProductOptionDto[] = product.options.map((option) => {
      const values: AdminProductOptionValueDto[] = option.values.map(
        (value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        }),
      );

      return {
        id: option.id,
        name: option.name,
        type: option.type,
        values,
      };
    });

    // Product variant DTO mapping.
    const variants: AdminProductVariantDto[] = product.variants.map(
      (variant) => {
        const variantOptions: AdminProductVariantOptionDto[] =
          variant.options.map((optionValue) => ({
            id: optionValue.id,
            value: optionValue.value,
            colorHex: optionValue.colorHex,
            optionId: optionValue.optionId,
            name: optionValue.option.name,
            type: optionValue.option.type,
          }));

        return {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          stock: variant.stock,
          isActive: variant.isActive,
          deletedAt: variant.deletedAt,
          options: variantOptions,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
        };
      },
    );

    // Final response.
    return {
      id: product.id,
      name: product.name,
      subDescription: product.subDescription,
      description: product.description,

      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      productDiscount: product.productDiscount
        ? {
            id: product.productDiscount.id,
            type: product.productDiscount.type,
            value: product.productDiscount.value.toString(),
            isActive: product.productDiscount.isActive,
            startsAt: product.productDiscount.startsAt,
            endsAt: product.productDiscount.endsAt,
          }
        : null,

      status: product.status,
      isFeatured: product.isFeatured,

      categoryId: product.categoryId,
      category,

      brandId: product.brandId,
      brand,

      sizeGuideId: product.sizeGuideId,
      sizeGuide,

      images,
      options,
      variants,

      deletedAt: product.deletedAt,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
