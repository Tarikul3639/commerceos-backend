import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../../infrastructure/database/generated/prisma/client.js';

import { UpdateProductDto } from '../../dto/requests/update-product.dto.js';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto.js';
import { GetAdminProductDetailsService } from './get-admin-product-details.service.js';
import { parseProductDiscountDate } from '../../utils/product-discount.util.js';

/** Updates a product and returns its complete details. */
@Injectable()
export class UpdateProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    productId: string,
    dto: UpdateProductDto,
    userId: string,
  ): Promise<AdminProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        name: true,
        subDescription: true,
        description: true,
        purchasePrice: true,
        sellingPrice: true,
        status: true,
        isFeatured: true,
        categoryId: true,
        brandId: true,
        sizeGuideId: true,
        productDiscount: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, deletedAt: null },
        select: { id: true },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: { id: dto.brandId, deletedAt: null },
        select: { id: true },
      });
      if (!brand) throw new NotFoundException('Brand not found');
    }

    if (dto.sizeGuideId) {
      const sizeGuide = await this.prisma.sizeGuide.findUnique({
        where: { id: dto.sizeGuideId },
        select: { id: true },
      });
      if (!sizeGuide) throw new NotFoundException('Size guide not found');
    }

    const nextSellingPrice = dto.sellingPrice ?? Number(product.sellingPrice);
    const discountToValidate =
      dto.productDiscount === undefined
        ? product.productDiscount
        : dto.productDiscount;
    if (discountToValidate?.isActive) {
      if (
        discountToValidate.type === 'PERCENTAGE' &&
        Number(discountToValidate.value) > 100
      ) {
        throw new BadRequestException('Percentage discount cannot exceed 100');
      }
      if (
        discountToValidate.type === 'FIXED' &&
        Number(discountToValidate.value) >= nextSellingPrice
      ) {
        throw new BadRequestException(
          'Fixed discount must be lower than the selling price',
        );
      }
      if (
        discountToValidate.endsAt &&
        discountToValidate.startsAt &&
        parseProductDiscountDate(discountToValidate.endsAt, true)! <=
          parseProductDiscountDate(discountToValidate.startsAt)!
      ) {
        throw new BadRequestException(
          'Discount end date must be after the start date',
        );
      }
    }

    const updatedProduct = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: product.id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.subDescription !== undefined && {
            subDescription: dto.subDescription,
          }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.purchasePrice !== undefined && {
            purchasePrice: dto.purchasePrice,
          }),
          ...(dto.sellingPrice !== undefined && {
            sellingPrice: dto.sellingPrice,
          }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.brandId !== undefined && { brandId: dto.brandId }),
          ...(dto.sizeGuideId !== undefined && {
            sizeGuideId: dto.sizeGuideId,
          }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        },
        select: {
          id: true,
          name: true,
          subDescription: true,
          description: true,
          purchasePrice: true,
          sellingPrice: true,
          status: true,
          categoryId: true,
          brandId: true,
          sizeGuideId: true,
        },
      });

      if (dto.productDiscount !== undefined) {
        if (dto.productDiscount === null) {
          await tx.productDiscount.deleteMany({
            where: { productId: product.id },
          });
        } else {
          await tx.productDiscount.upsert({
            where: { productId: product.id },
            create: {
              productId: product.id,
              isActive: dto.productDiscount.isActive,
              type: dto.productDiscount.type,
              value: dto.productDiscount.value,
              startsAt: parseProductDiscountDate(dto.productDiscount.startsAt),
              endsAt: parseProductDiscountDate(
                dto.productDiscount.endsAt,
                true,
              ),
            },
            update: {
              isActive: dto.productDiscount.isActive,
              type: dto.productDiscount.type,
              value: dto.productDiscount.value,
              startsAt: parseProductDiscountDate(dto.productDiscount.startsAt),
              endsAt: parseProductDiscountDate(
                dto.productDiscount.endsAt,
                true,
              ),
            },
          });
        }
      }

      return updated;
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT',
      description: `Product "${updatedProduct.name}" was updated`,
      entityType: 'Product',
      entityId: updatedProduct.id,
      userId,
      oldValue: {
        name: product.name,
        subDescription: product.subDescription,
        description: product.description,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        status: product.status,
        isFeatured: product.isFeatured,
        categoryId: product.categoryId,
        brandId: product.brandId,
        sizeGuideId: product.sizeGuideId,
        productDiscount: product.productDiscount,
      },
      newValue: {
        name: updatedProduct.name,
        subDescription: updatedProduct.subDescription,
        description: updatedProduct.description,
        purchasePrice: updatedProduct.purchasePrice,
        sellingPrice: updatedProduct.sellingPrice,
        status: updatedProduct.status,
        isFeatured: dto.isFeatured ?? product.isFeatured,
        categoryId: updatedProduct.categoryId,
        brandId: updatedProduct.brandId,
        sizeGuideId: updatedProduct.sizeGuideId,
        productDiscount:
          dto.productDiscount === undefined
            ? product.productDiscount
              ? {
                  type: product.productDiscount.type,
                  value: product.productDiscount.value.toString(),
                  isActive: product.productDiscount.isActive,
                  startsAt:
                    product.productDiscount.startsAt?.toISOString() ?? null,
                  endsAt: product.productDiscount.endsAt?.toISOString() ?? null,
                }
              : null
            : dto.productDiscount
              ? {
                  type: dto.productDiscount.type,
                  value: dto.productDiscount.value,
                  isActive: dto.productDiscount.isActive,
                  startsAt: dto.productDiscount.startsAt ?? null,
                  endsAt: dto.productDiscount.endsAt ?? null,
                }
              : null,
      },
    });

    return this.getAdminProductDetailsService.execute(product.id);
  }
}
