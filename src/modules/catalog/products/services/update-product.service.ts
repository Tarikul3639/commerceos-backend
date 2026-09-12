import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateProductDto } from '../dto/requests/update-product.dto';

import { generateSlug } from '../../../../common/utils/slug.util';

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

        /**
         * Generate new slug if name changes
         */
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

        /**
         * Validate category
         */
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

        /**
         * Validate brand
         */
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

        /**
         * Update product
         */
        return this.prisma.product.update({
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

                ...(updateProductDto.description !== undefined && {
                    description: updateProductDto.description,
                }),

                ...(updateProductDto.categoryId !== undefined && {
                    categoryId: updateProductDto.categoryId,
                }),

                ...(updateProductDto.brandId !== undefined && {
                    brandId: updateProductDto.brandId,
                }),

                ...(updateProductDto.thumbnail !== undefined && {
                    thumbnail: updateProductDto.thumbnail,
                }),

                ...(updateProductDto.publicId !== undefined && {
                    publicId: updateProductDto.publicId,
                }),

                ...(updateProductDto.isActive !== undefined && {
                    isActive: updateProductDto.isActive,
                }),
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                thumbnail: true,
                publicId: true,
                isActive: true,

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
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
