import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { ProductDetailResponseDto } from '../dto/responses/product-detail-response.dto';
import {
    ProductBrandResponseDto,
    ProductCategoryResponseDto,
} from '../dto/responses/product-response.dto';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';
import { ProductDiscountResponseDto } from '../dto/responses/product-discount-response.dto';
import { ProductColorResponseDto } from '../dto/responses/product-color-response.dto';
import { ProductReviewResponseDto } from '../dto/responses/product-review-response.dto';
import { ProductRatingResponseDto } from '../dto/responses/product-rating-response.dto';

/*
 * SERVICE: GetProductService
 */

@Injectable()
export class GetProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string): Promise<ProductDetailResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
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

                discounts: {
                    where: {
                        isActive: true,
                        deletedAt: null,
                    },
                    include: {
                        discount: true,
                    },
                },

                reviews: {
                    where: {
                        isActive: true,
                        deletedAt: null,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        customer: {
                            select: {
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const discounts: ProductDiscountResponseDto[] = product.discounts.map(
            ({ discount }) => ({
                id: discount.id,
                name: discount.name,
                description: discount.description,
                type: discount.type,
                value: discount.value.toString(),
                startDate: discount.startDate,
                endDate: discount.endDate,
                isActive: discount.isActive,
            }),
        );

        const colors = product.colors as unknown as
            ProductColorResponseDto[] | null;

        const images: ProductImageResponseDto[] = product.images.map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
            publicId: image.publicId,
            sortOrder: image.sortOrder,
            createdAt: image.createdAt,
            updatedAt: image.updatedAt,
        }));

        const reviews: ProductReviewResponseDto[] = product.reviews.map(
            (review) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                customerId: review.customerId,
                avatarUrl: review.customer.avatarUrl,
                createdAt: review.createdAt,
            }),
        );

        const rating: ProductRatingResponseDto = {
            average: reviews.length
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                reviews.length
                : 0,
            count: reviews.length,
        };

        const category: ProductCategoryResponseDto = {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
        };

        const brand: ProductBrandResponseDto | null = product.brand
            ? {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
                website: product.brand.website,
            }
            : null;

        return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            description: product.description,
            subDescription: product.subDescription,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
            stock: product.stock,
            sizes: product.sizes,
            colors,
            isActive: product.isActive,
            deletedAt: product.deletedAt,
            category,
            brand,
            images,
            discounts,
            reviews,
            rating,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
