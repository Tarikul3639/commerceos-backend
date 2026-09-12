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
                        purchasePrice: true,
                        sellingPrice: true,
                        image: true,
                        publicId: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,

                        attributeValues: {
                            select: {
                                attributeValue: {
                                    select: {
                                        id: true,
                                        value: true,

                                        attribute: {
                                            select: {
                                                id: true,
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
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
            isActive: product.isActive,

            category: product.category,

            brand: product.brand,

            images: product.images,

            variants: product.productVariants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                barcode: variant.barcode ,

                purchasePrice: variant.purchasePrice.toString(),
                sellingPrice: variant.sellingPrice.toString(),

                image: variant.image,
                publicId: variant.publicId,
                isActive: variant.isActive,

                attributes: variant.attributeValues.map(({ attributeValue }) => ({
                    attributeId: attributeValue.attribute.id,
                    attributeName: attributeValue.attribute.name,
                    attributeValueId: attributeValue.id,
                    attributeValue: attributeValue.value,
                })),

                createdAt: variant.createdAt,
                updatedAt: variant.updatedAt,
            })),

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
