import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductDto } from '@/modules/catalog/products/dto/requests/update-product.dto';

@Injectable()
export class UpdateProductService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    productId: string,
    userId: string,
    updateProductDto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        brandId: true,
        discount: { select: { id: true, startDate: true, endDate: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.discount) {
      const startDate =
        updateProductDto.discount.startDate === undefined
          ? product.discount?.startDate
          : updateProductDto.discount.startDate
            ? new Date(updateProductDto.discount.startDate)
            : null;
      const endDate =
        updateProductDto.discount.endDate === undefined
          ? product.discount?.endDate
          : updateProductDto.discount.endDate
            ? new Date(updateProductDto.discount.endDate)
            : null;

      if (startDate && endDate && endDate < startDate) {
        throw new BadRequestException(
          'Discount end date must be on or after its start date',
        );
      }
    }

    if (
      updateProductDto.categoryId !== undefined &&
      updateProductDto.categoryId !== product.categoryId
    ) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: updateProductDto.categoryId,
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
    }

    if (
      updateProductDto.brandId !== undefined &&
      updateProductDto.brandId !== null
    ) {
      const brand = await this.prisma.brand.findFirst({
        where: {
          id: updateProductDto.brandId,
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

    const imageUpdates = (updateProductDto.images ?? []).filter(
      (image): image is typeof image & { id: string } => image.id !== undefined,
    );
    const imageCreates = (updateProductDto.images ?? []).filter(
      (image) => image.id === undefined,
    );
    const imageIds = imageUpdates.map((image) => image.id);
    const imageIdsToDelete = updateProductDto.imageIdsToDelete ?? [];

    if (new Set(imageIds).size !== imageIds.length) {
      throw new BadRequestException(
        'Duplicate product image IDs are not allowed',
      );
    }

    if (new Set(imageIdsToDelete).size !== imageIdsToDelete.length) {
      throw new BadRequestException(
        'Duplicate image deletion IDs are not allowed',
      );
    }

    if (imageIds.some((id) => imageIdsToDelete.includes(id))) {
      throw new BadRequestException(
        'An image cannot be updated and deleted together',
      );
    }

    if (imageIds.length) {
      const existingImages = await this.prisma.productImage.findMany({
        where: {
          id: {
            in: imageIds,
          },
          productId,
        },
        select: {
          id: true,
        },
      });

      if (existingImages.length !== imageIds.length) {
        throw new NotFoundException('One or more product images not found');
      }
    }

    const publicIds = (updateProductDto.images ?? [])
      .map((image) => image.publicId)
      .filter((publicId): publicId is string => publicId !== undefined);

    if (new Set(publicIds).size !== publicIds.length) {
      throw new ConflictException('Duplicate image public ID');
    }

    if (publicIds.length) {
      const existingPublicIds = await this.prisma.productImage.findMany({
        where: {
          publicId: { in: publicIds },
          id: { notIn: [...imageIds, ...imageIdsToDelete] },
        },
        select: { id: true },
      });

      if (existingPublicIds.length > 0) {
        throw new ConflictException('Image public ID already exists');
      }
    }

    if (imageIdsToDelete.length) {
      const deletableImages = await this.prisma.productImage.findMany({
        where: { id: { in: imageIdsToDelete }, productId },
        select: { id: true },
      });

      if (deletableImages.length !== imageIdsToDelete.length) {
        throw new NotFoundException('One or more product images not found');
      }
    }

    if (imageCreates.some((image) => !image.imageUrl || !image.publicId)) {
      throw new BadRequestException(
        'New images require an image URL and public ID',
      );
    }

    const updatedProduct = await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(updateProductDto.name !== undefined && {
          name: updateProductDto.name,
        }),

        ...(updateProductDto.description !== undefined && {
          description: updateProductDto.description,
        }),

        ...(updateProductDto.subDescription !== undefined && {
          subDescription: updateProductDto.subDescription,
        }),

        ...(updateProductDto.purchasePrice !== undefined && {
          purchasePrice: updateProductDto.purchasePrice,
        }),

        ...(updateProductDto.sellingPrice !== undefined && {
          sellingPrice: updateProductDto.sellingPrice,
        }),

        ...(updateProductDto.sku !== undefined && {
          sku: updateProductDto.sku,
        }),

        ...(updateProductDto.barcode !== undefined && {
          barcode: updateProductDto.barcode,
        }),

        ...(updateProductDto.stock !== undefined && {
          stock: updateProductDto.stock,
        }),

        ...(updateProductDto.sizes !== undefined && {
          sizes: updateProductDto.sizes,
        }),

        ...(updateProductDto.colors !== undefined && {
          colors: updateProductDto.colors as unknown as Prisma.InputJsonValue,
        }),

        ...(updateProductDto.categoryId !== undefined && {
          categoryId: updateProductDto.categoryId,
        }),

        ...(updateProductDto.brandId !== undefined && {
          brandId: updateProductDto.brandId,
        }),

        ...(updateProductDto.isActive !== undefined && {
          isActive: updateProductDto.isActive,
        }),

        ...(updateProductDto.discount === null &&
          product.discount && {
            discount: { delete: true },
          }),
        ...(updateProductDto.discount && {
          discount: {
            upsert: {
              create: {
                value: new Prisma.Decimal(updateProductDto.discount.value),
                startDate: updateProductDto.discount.startDate
                  ? new Date(updateProductDto.discount.startDate)
                  : null,
                endDate: updateProductDto.discount.endDate
                  ? new Date(updateProductDto.discount.endDate)
                  : null,
                createdById: userId,
              },
              update: {
                value: new Prisma.Decimal(updateProductDto.discount.value),
                ...(updateProductDto.discount.startDate !== undefined && {
                  startDate: updateProductDto.discount.startDate
                    ? new Date(updateProductDto.discount.startDate)
                    : null,
                }),
                ...(updateProductDto.discount.endDate !== undefined && {
                  endDate: updateProductDto.discount.endDate
                    ? new Date(updateProductDto.discount.endDate)
                    : null,
                }),
              },
            },
          },
        }),

        ...((imageUpdates.length ||
          imageCreates.length ||
          imageIdsToDelete.length) && {
          images: {
            ...(imageUpdates.length > 0 && {
              update: imageUpdates.map((image) => ({
                where: { id: image.id },
                data: {
                  ...(image.imageUrl !== undefined && {
                    imageUrl: image.imageUrl,
                  }),
                  ...(image.publicId !== undefined && {
                    publicId: image.publicId,
                  }),
                  ...(image.sortOrder !== undefined && {
                    sortOrder: image.sortOrder,
                  }),
                },
              })),
            }),
            ...(imageCreates.length > 0 && {
              create: imageCreates.map((image) => ({
                imageUrl: image.imageUrl!,
                publicId: image.publicId!,
                sortOrder: image.sortOrder ?? 0,
              })),
            }),
            ...(imageIdsToDelete.length > 0 && {
              deleteMany: { id: { in: imageIdsToDelete } },
            }),
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
      ...updatedProduct,
      purchasePrice: updatedProduct.purchasePrice.toString(),
      sellingPrice: updatedProduct.sellingPrice.toString(),
      discount: updatedProduct.discount
        ? {
            id: updatedProduct.discount.id,
            value: updatedProduct.discount.value.toString(),
            startDate: updatedProduct.discount.startDate,
            endDate: updatedProduct.discount.endDate,
            createdById: updatedProduct.discount.createdById,
          }
        : null,
    };
  }
}
