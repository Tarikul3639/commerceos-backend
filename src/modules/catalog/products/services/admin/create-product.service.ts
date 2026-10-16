import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { CreateProductDto } from '../../dto/requests/create-product.dto';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto';
import { GetAdminProductDetailsService } from './get-admin-product-details.service';

/** Creates a product and returns its complete details. */
@Injectable()
export class CreateProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(dto: CreateProductDto): Promise<AdminProductDetailResponseDto> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: dto.brandId },
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
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        categoryId: category.id,
        ...(dto.brandId !== undefined && {
          brandId: dto.brandId,
        }),
        ...(dto.sizeGuideId !== undefined && {
          sizeGuideId: dto.sizeGuideId,
        }),
        ...(dto.status !== undefined && {
          status: dto.status,
        }),
      },
      select: {
        id: true,
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'CREATE_PRODUCT',
      description: `Product "${dto.name}" was created`,
      entityType: 'Product',
      entityId: product.id,
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
      },
    });

    return this.getAdminProductDetailsService.execute(product.id);
  }
}
