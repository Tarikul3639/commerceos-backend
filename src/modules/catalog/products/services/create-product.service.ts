import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductDto } from '@/modules/catalog/products/dto/requests/create-product.dto';
import { ProductResponseDto } from '@/modules/catalog/products/dto/responses/product-response.dto';

@Injectable()
export class CreateProductService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    if (
      dto.discount?.startDate &&
      dto.discount.endDate &&
      new Date(dto.discount.endDate) < new Date(dto.discount.startDate)
    ) {
      throw new BadRequestException(
        'Discount end date must be on or after its start date',
      );
    }
    const existing = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
      select: { sku: true },
    });

    if (existing) {
      throw new ConflictException('A product with this SKU already exists');
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found or inactive');
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findFirst({
        where: {
          id: dto.brandId,
          deletedAt: null,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found or inactive');
      }
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,

        ...(dto.barcode !== undefined && {
          barcode: dto.barcode,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.subDescription !== undefined && {
          subDescription: dto.subDescription,
        }),

        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        stock: dto.stock ?? 0,
        sizes: dto.sizes ?? [],

        ...(dto.colors !== undefined && {
          colors: dto.colors as unknown as Prisma.InputJsonValue,
        }),

        categoryId: dto.categoryId,

        ...(dto.brandId !== undefined && {
          brandId: dto.brandId,
        }),

        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),

        ...(dto.images?.length && {
          images: {
            create: dto.images.map((image) => ({
              imageUrl: image.imageUrl,
              publicId: image.publicId,
              sortOrder: image.sortOrder ?? 0,
            })),
          },
        }),
        ...(dto.discount && {
          discount: {
            create: {
              value: new Prisma.Decimal(dto.discount.value),
              startDate: dto.discount.startDate
                ? new Date(dto.discount.startDate)
                : null,
              endDate: dto.discount.endDate
                ? new Date(dto.discount.endDate)
                : null,
              createdById: userId,
            },
          },
        }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        discount: true,
      },
    });

    return {
      ...product,
      colors: product.colors as unknown as ProductResponseDto['colors'],
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      discount: product.discount
        ? {
            id: product.discount.id,
            value: product.discount.value.toString(),
            startDate: product.discount.startDate,
            endDate: product.discount.endDate,
            createdById: product.discount.createdById,
          }
        : null,
    };
  }
}
