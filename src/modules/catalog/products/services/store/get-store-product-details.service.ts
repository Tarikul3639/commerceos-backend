import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';
import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto.js';
import { getEffectiveProductPrice } from '../../utils/effective-product-price.util.js';

@Injectable()
export class GetStoreProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<StoreProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'PUBLISHED' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        brand: true,
        sizeGuide: true,
        productDiscount: true,
        options: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true, deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

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

    const options = product.options.map((option) => ({
      id: option.id,
      name: option.name,
      type: option.type,
      values: (
        option.values as Array<{
          id: string;
          label: string;
          colorCode?: string;
        }>
      ).map((value) => ({
        id: value.id,
        label: value.label,
        colorCode: value.colorCode ?? null,
      })),
    }));

    return {
      id: product.id,
      name: product.name,
      subDescription: product.subDescription,
      description: product.description,
      sellingPrice: effectiveSellingPrice.toString(),
      originalPrice: hasDiscount ? product.sellingPrice.toString() : null,
      discountPercentage,
      category: { id: product.category.id, name: product.category.name },
      brand: product.brand
        ? { id: product.brand.id, name: product.brand.name }
        : null,
      sizeGuide: product.sizeGuide,
      images: product.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        sortOrder: image.sortOrder,
      })),
      options,
      variants: product.variants.map((variant) => {
        const selected = variant.options as Record<string, string>;
        const variantOptions = product.options.flatMap((option) => {
          const valueId = selected[option.id];
          const value = (
            option.values as Array<{
              id: string;
              label: string;
              colorCode?: string;
            }>
          ).find((item) => item.id === valueId);
          return value
            ? [
                {
                  id: value.id,
                  label: value.label,
                  colorCode: value.colorCode ?? null,
                  optionId: option.id,
                  optionName: option.name,
                  optionType: option.type,
                },
              ]
            : [];
        });

        return {
          id: variant.id,
          sku: variant.sku,
          stock: variant.stock,
          isAvailable: variant.stock > 0,
          options: variantOptions,
        };
      }),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
