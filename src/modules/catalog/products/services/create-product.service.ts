import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateProductDto } from '../dto/requests/create-product.dto';
import { ProductResponseDto } from '../dto/responses/product-response.dto';

@Injectable()
export class CreateProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
        const existing = await this.prisma.product.findFirst({
            where: {
                OR: [{ slug: dto.slug }, { sku: dto.sku }],
            },
            select: {
                slug: true,
                sku: true,
            },
        });

        if (existing) {
            throw new ConflictException(
                existing.sku === dto.sku
                    ? 'A product with this SKU already exists'
                    : 'A product with this slug already exists',
            );
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
                slug: dto.slug,
                sku: dto.sku,

                ...(dto.barcode !== undefined && {
                    barcode: dto.barcode,
                }),

                ...(dto.description !== undefined && {
                    description: dto.description,
                }),

                purchasePrice: dto.purchasePrice,
                sellingPrice: dto.sellingPrice,
                stock: dto.stock ?? 0,
                sizes: dto.sizes ?? [],

                ...(dto.colors !== undefined && {
                    colors: dto.colors as Prisma.InputJsonValue,
                }),

                categoryId: dto.categoryId,

                ...(dto.brandId !== undefined && {
                    brandId: dto.brandId,
                }),

                ...(dto.publicId !== undefined && {
                    publicId: dto.publicId,
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
            ...product,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
        };
    }
}
