import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class UpdateProductVariantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deletedAt: null,
      },
      select: {
        id: true,
        productId: true,
        title: true,
        sku: true,
        barcode: true,
        stock: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        options: {
          include: {
            option: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (dto.sku !== undefined) {
      const existingSku = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
        select: { id: true },
      });

      if (existingSku && existingSku.id !== variant.id) {
        throw new ConflictException('SKU already exists');
      }
    }

    if (dto.barcode !== undefined) {
      const existingBarcode = await this.prisma.productVariant.findUnique({
        where: { barcode: dto.barcode },
        select: { id: true },
      });

      if (existingBarcode && existingBarcode.id !== variant.id) {
        throw new ConflictException('Barcode already exists');
      }
    }

    if (dto.optionValueIds !== undefined) {
      const optionValueIds = dto.optionValueIds;

      const optionValues =
        optionValueIds.length === 0
          ? []
          : await this.prisma.productOptionValue.findMany({
            where: {
              id: { in: optionValueIds },
              option: {
                productId: variant.productId,
              },
            },
            select: { id: true },
          });

      if (optionValues.length !== optionValueIds.length) {
        throw new BadRequestException(
          'One or more option values are invalid for this product',
        );
      }
    }

    const updatedVariant = await this.prisma.productVariant.update({
      where: {
        id: variant.id,
      },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.barcode !== undefined && { barcode: dto.barcode }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.optionValueIds !== undefined && {
          options: {
            set: dto.optionValueIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        options: {
          include: {
            option: true,
          },
        },
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT_VARIANT',
      description: `Product variant "${updatedVariant.title ?? updatedVariant.sku}" was updated`,
      entityType: 'ProductVariant',
      entityId: updatedVariant.id,
      oldValue: {
        title: variant.title,
        sku: variant.sku,
        barcode: variant.barcode,
        stock: variant.stock,
        isActive: variant.isActive,
        options: variant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
      },
      newValue: {
        title: updatedVariant.title,
        sku: updatedVariant.sku,
        barcode: updatedVariant.barcode,
        stock: updatedVariant.stock,
        isActive: updatedVariant.isActive,
        options: updatedVariant.options.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
          optionId: value.optionId,
          optionName: value.option.name,
          optionType: value.option.type,
        })),
      },
    });

    return {
      id: updatedVariant.id,
      productId: updatedVariant.productId,
      title: updatedVariant.title,
      sku: updatedVariant.sku,
      barcode: updatedVariant.barcode,
      stock: updatedVariant.stock,
      isActive: updatedVariant.isActive,
      deletedAt: updatedVariant.deletedAt,
      createdAt: updatedVariant.createdAt,
      updatedAt: updatedVariant.updatedAt,
      options: updatedVariant.options.map((value) => ({
        id: value.id,
        value: value.value,
        colorHex: value.colorHex,
        optionId: value.optionId,
        optionName: value.option.name,
        optionType: value.option.type,
      })),
    };
  }
}
