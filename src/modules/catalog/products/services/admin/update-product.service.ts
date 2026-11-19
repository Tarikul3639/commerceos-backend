import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../../lib/prisma/client.js';

import { UpdateProductDto } from '../../dto/requests/update-product.dto.js';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto.js';
import { GetAdminProductDetailsService } from './get-admin-product-details.service.js';

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
      where: {
        id: productId,
        deletedAt: null,
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

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: {
          id: dto.brandId,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    if (dto.sizeGuideId) {
      const sizeGuide = await this.prisma.sizeGuide.findUnique({
        where: {
          id: dto.sizeGuideId,
        },
        select: {
          id: true,
        },
      });

      if (!sizeGuide) {
        throw new NotFoundException('Size guide not found');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: {
        id: product.id,
      },
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
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId,
        }),
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

    // Activity Log Creation
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
        categoryId: product.categoryId,
        brandId: product.brandId,
        sizeGuideId: product.sizeGuideId,
      },
      newValue: {
        name: updatedProduct.name,
        subDescription: updatedProduct.subDescription,
        description: updatedProduct.description,
        purchasePrice: updatedProduct.purchasePrice,
        sellingPrice: updatedProduct.sellingPrice,
        status: updatedProduct.status,
        categoryId: updatedProduct.categoryId,
        brandId: updatedProduct.brandId,
        sizeGuideId: updatedProduct.sizeGuideId,
      },
    });
    return this.getAdminProductDetailsService.execute(product.id);
  }
}
