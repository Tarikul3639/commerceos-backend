import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CreateProductDto } from '../dto/requests/create-product.dto';

@Injectable()
export class CreateProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(createProductDto: CreateProductDto) {
        const {
            name,
            slug,
            description,
            categoryId,
            brandId,
            sizeChartId,
            thumbnail,
            publicId,
            isActive,
            purchasePrice,
            sellingPrice,
        } = createProductDto;

        /**
         * Check whether the slug already exists
         */
        const existingProduct = await this.prisma.product.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
            },
        });

        if (existingProduct) {
            throw new ConflictException('A product with this slug already exists');
        }

        /**
         * Check category
         */
        const category = await this.prisma.category.findFirst({
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
            throw new NotFoundException('Category not found or inactive');
        }

        /**
         * Check brand if provided
         */
        if (brandId) {
            const brand = await this.prisma.brand.findFirst({
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
                throw new NotFoundException('Brand not found or inactive');
            }
        }

        /**
         * Check size chart if provided
         */
        if (sizeChartId) {
            const sizeChart = await this.prisma.sizeChart.findUnique({
                where: {
                    id: sizeChartId,
                },
                select: {
                    id: true,
                },
            });

            if (!sizeChart) {
                throw new NotFoundException('Size chart not found');
            }
        }

        /**
         * Create product
         */
        return this.prisma.product.create({
            data: {
                name,
                slug,
                purchasePrice,
                sellingPrice,

                ...(description !== undefined && {
                    description,
                }),

                categoryId,

                ...(brandId !== undefined && {
                    brandId,
                }),

                ...(sizeChartId !== undefined && {
                    sizeChartId,
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
                purchasePrice: true,
                sellingPrice: true,
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

                sizeChart: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                createdAt: true,
                updatedAt: true,
            },
        });
    }
}
