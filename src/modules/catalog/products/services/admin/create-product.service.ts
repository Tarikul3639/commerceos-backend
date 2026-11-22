import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../../infrastructure/database/generated/prisma/client.js';

import { CreateProductDto } from '../../dto/requests/create-product.dto.js';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto.js';
import { GetAdminProductDetailsService } from './get-admin-product-details.service.js';
import { parseProductDiscountDate } from '../../utils/product-discount.util.js';

/** Creates a product and returns its complete details. */
@Injectable()
export class CreateProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    dto: CreateProductDto,
    userId: string,
  ): Promise<AdminProductDetailResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, deletedAt: null },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: { id: dto.brandId, deletedAt: null },
        select: { id: true },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.sizeGuideId) {
      const sizeGuide = await this.prisma.sizeGuide.findUnique({
        where: { id: dto.sizeGuideId },
        select: { id: true },
      });

      if (!sizeGuide) {
        throw new NotFoundException('Size guide not found');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        ...(dto.subDescription !== undefined && {
          subDescription: dto.subDescription,
        }),
        ...(dto.description !== undefined && { description: dto.description }),
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        categoryId: category.id,
        ...(dto.brandId !== undefined && { brandId: dto.brandId }),
        ...(dto.sizeGuideId !== undefined && { sizeGuideId: dto.sizeGuideId }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        ...(dto.productDiscount && {
          productDiscount: {
            create: {
              isActive: dto.productDiscount.isActive,
              type: dto.productDiscount.type,
              value: dto.productDiscount.value,
              startsAt: parseProductDiscountDate(dto.productDiscount.startsAt),
              endsAt: parseProductDiscountDate(
                dto.productDiscount.endsAt,
                true,
              ),
            },
          },
        }),
      },
      select: { id: true },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'CREATE_PRODUCT',
      description: `Product "${dto.name}" was created`,
      entityType: 'Product',
      entityId: product.id,
      userId,
      newValue: {
        name: dto.name,
        subDescription: dto.subDescription ?? null,
        description: dto.description ?? null,
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        categoryId: category.id,
        brandId: dto.brandId ?? null,
        sizeGuideId: dto.sizeGuideId ?? null,
        status: dto.status ?? null,
        isFeatured: dto.isFeatured ?? false,
      },
    });

    return this.getAdminProductDetailsService.execute(product.id);
  }
}
