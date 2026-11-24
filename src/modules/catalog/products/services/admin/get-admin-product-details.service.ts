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
} from '../../dto/responses/admin-product-detail-response.dto.js';

@Injectable()
export class GetAdminProductDetailsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(productId: string): Promise<AdminProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
        sizeGuide: true,
        productDiscount: true,
        images: { orderBy: { sortOrder: 'asc' } },
        options: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { deletedAt: null } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');

    const category: AdminProductRelationDto = product.category;
    const brand: AdminProductRelationDto | null = product.brand;
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

    const images: AdminProductImageDto[] = product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      publicId: image.publicId,
      sortOrder: image.sortOrder,
    }));

    const options: AdminProductOptionDto[] = product.options.map((option) => ({
      id: option.id,
      name: option.name,
      type: option.type,
      sortOrder: option.sortOrder,
      values: (
        option.values as Array<{
          id: string;
          label: string;
          colorCode?: string;
        }>
      ).map((value): AdminProductOptionValueDto => ({
        id: value.id,
        label: value.label,
        colorCode: value.colorCode ?? null,
      })),
    }));

    const variants: AdminProductVariantDto[] = product.variants.map(
      (variant) => ({
        id: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        stock: variant.stock,
        isActive: variant.isActive,
        deletedAt: variant.deletedAt,
        options: variant.options as Record<string, string>,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
      }),
    );

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
