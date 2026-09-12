import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CreateProductDto } from '../dto/requests/create-product.dto';
import { generateSlug } from '../../../../common/utils/slug.util';

@Injectable()
export class CreateProductService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        createProductDto: CreateProductDto,
    ) {
        const {
            name,
            description,
            categoryId,
            brandId,
            thumbnail,
            publicId,
            isActive,
        } = createProductDto;

        /**
         * Generate product slug
         */
        const slug = generateSlug(name);

        /**
         * Check whether the slug already exists
         */
        const existingProduct =
            await this.prisma.product.findUnique({
                where: {
                    slug,
                },

                select: {
                    id: true,
                },
            });

        if (existingProduct) {
            throw new ConflictException(
                'A product with this name already exists',
            );
        }

        /**
         * Check category
         */
        const category =
            await this.prisma.category.findFirst({
                where: {
                    id: categoryId,
                    deletedAt: null,
                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found or inactive',
            );
        }

        /**
         * Check brand if provided
         */
        if (brandId) {
            const brand =
                await this.prisma.brand.findFirst({
                    where: {
                        id: brandId,
                        deletedAt: null,
                        isActive: true,
                    },

                    select: {
                        id: true,
                    },
                });

            if (!brand) {
                throw new NotFoundException(
                    'Brand not found or inactive',
                );
            }
        }

        /**
         * Create product
         */
        return this.prisma.product.create({
            data: {
                name,
                slug,

                ...(description !== undefined && {
                    description,
                }),

                categoryId,

                ...(brandId !== undefined && {
                    brandId,
                }),

                ...(thumbnail !== undefined && {
                    thumbnail,
                }),

                ...(publicId !== undefined && {
                    publicId,
                }),

                ...(isActive !== undefined && {
                    isActive,
                }),
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                thumbnail: true,
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
