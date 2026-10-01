import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { generateSlug } from '../../../../common/utils/slug.util';

import { UpdateProductDto } from '../dto/requests/update-product.dto';

@Injectable()
export class UpdateProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string, updateProductDto: UpdateProductDto) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                categoryId: true,
                brandId: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        let slug: string | undefined;

        if (
            updateProductDto.name !== undefined &&
            updateProductDto.name !== product.name
        ) {
            slug = generateSlug(updateProductDto.name);

            const existingProduct = await this.prisma.product.findFirst({
                where: {
                    slug,
                    id: {
                        not: productId,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existingProduct) {
                throw new ConflictException('A product with this name already exists');
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

        if (updateProductDto.images?.length) {
            const imageIds = updateProductDto.images.map((image) => image.id);

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

            const publicIds = updateProductDto.images
                .map((image) => image.publicId)
                .filter((publicId): publicId is string => publicId !== undefined);

            if (new Set(publicIds).size !== publicIds.length) {
                throw new ConflictException('Duplicate image public ID');
            }

            const existingPublicIds = await this.prisma.productImage.findMany({
                where: {
                    publicId: {
                        in: publicIds,
                    },
                    id: {
                        notIn: imageIds,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existingPublicIds.length > 0) {
                throw new ConflictException('Image public ID already exists');
            }
        }

        const updatedProduct = await this.prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                ...(updateProductDto.name !== undefined && {
                    name: updateProductDto.name,
                }),

                ...(slug !== undefined && {
                    slug,
                }),

                ...(updateProductDto.slug !== undefined && {
                    slug: updateProductDto.slug,
                }),

                ...(updateProductDto.description !== undefined && {
                    description: updateProductDto.description,
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
                    colors: updateProductDto.colors as Prisma.InputJsonValue,
                }),

                ...(updateProductDto.categoryId !== undefined && {
                    categoryId: updateProductDto.categoryId,
                }),

                ...(updateProductDto.brandId !== undefined && {
                    brandId: updateProductDto.brandId,
                }),

                ...(updateProductDto.publicId !== undefined && {
                    publicId: updateProductDto.publicId,
                }),

                ...(updateProductDto.isActive !== undefined && {
                    isActive: updateProductDto.isActive,
                }),

                ...(updateProductDto.images?.length && {
                    images: {
                        update: updateProductDto.images.map((image) => ({
                            where: {
                                id: image.id,
                            },
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
            },
        });

        return {
            ...updatedProduct,
            purchasePrice: updatedProduct.purchasePrice.toString(),
            sellingPrice: updatedProduct.sellingPrice.toString(),
        };
    }
}
