import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ProductDetailResponseDto } from '../dto/responses/product-detail-response.dto';

@Injectable()
export class GetProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductDetailResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                thumbnail: true,
                publicId: true,
                purchasePrice: true,
                sellingPrice: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

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

                images: {
                    select: {
                        id: true,
                        imageUrl: true,
                        publicId: true,
                        sortOrder: true,
                        createdAt: true,
                        updatedAt: true,
                    },

                    orderBy: {
                        sortOrder: 'asc',
                    },
                },

                productVariants: {
                    where: {
                        deletedAt: null,
                    },

                    select: {
                        id: true,
                        sku: true,
                        barcode: true,
                        color: true,
                        colorHex: true,
                        size: true,
                        image: true,
                        publicId: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },

                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            thumbnail: product.thumbnail,
            publicId: product.publicId,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
            isActive: product.isActive,

            category: product.category,

            brand: product.brand,

            images: product.images,

            variants: product.productVariants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                barcode: variant.barcode,
                color: variant.color,
                colorHex: variant.colorHex,
                size: variant.size,
                image: variant.image,
                publicId: variant.publicId,
                isActive: variant.isActive,

                createdAt: variant.createdAt,
                updatedAt: variant.updatedAt,
            })),

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
