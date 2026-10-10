
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto';

@Injectable()
export class GetStoreProductDetailsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
    ): Promise<StoreProductDetailResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
                status: 'PUBLISHED',
            },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                category: true,
                brand: true,
                sizeGuide: true,
                options: {
                    include: {
                        values: {
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                variants: {
                    where: {
                        isActive: true,
                        deletedAt: null,
                    },
                    include: {
                        options: {
                            include: {
                                option: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return {
            id: product.id,
            name: product.name,
            subDescription: product.subDescription,
            description: product.description,
            sellingPrice: product.sellingPrice.toString(),

            category: {
                id: product.category.id,
                name: product.category.name,
            },

            brand: product.brand
                ? {
                    id: product.brand.id,
                    name: product.brand.name,
                }
                : null,

            sizeGuide: product.sizeGuide,

            images: product.images.map((image) => ({
                id: image.id,
                imageUrl: image.imageUrl,
                publicId: image.publicId,
                sortOrder: image.sortOrder,
            })),

            options: product.options.map((option) => ({
                id: option.id,
                name: option.name,
                type: option.type,
                values: option.values.map((value) => ({
                    id: value.id,
                    value: value.value,
                    colorHex: value.colorHex,
                })),
            })),

            variants: product.variants.map((variant) => ({
                id: variant.id,
                title: variant.title,
                sku: variant.sku,
                stock: variant.stock,
                isAvailable: variant.stock > 0,
                options: variant.options.map((value) => ({
                    id: value.id,
                    value: value.value,
                    colorHex: value.colorHex,
                    optionId: value.optionId,
                    optionName: value.option.name,
                    optionType: value.option.type,
                })),
            })),

            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
