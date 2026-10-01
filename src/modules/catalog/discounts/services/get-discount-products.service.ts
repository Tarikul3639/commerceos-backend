import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { DiscountProductsResponseDto } from '../dto/responses/discount-products-response.dto';
import { DiscountProductResponseDto } from '../dto/responses/discount-product-response.dto';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto';

@Injectable()
export class GetDiscountProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        discountId: string,
        query: DiscountQueryDto,
    ): Promise<DiscountProductsResponseDto> {
        const discount = await this.prisma.discount.findFirst({
            where: {
                id: discountId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        const page = Number(query.page ?? 1);
        const limit = Number(query.limit ?? 10);
        const skip = (page - 1) * limit;

        const where = {
            discountId,
            deletedAt: null,
            isActive: true,
            product: {
                deletedAt: null,
            },
        };

        const [productDiscounts, total] = await this.prisma.$transaction([
            this.prisma.productDiscount.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            images: {
                                select: { imageUrl: true, sortOrder: true },
                                orderBy: { sortOrder: 'asc' },
                                take: 1,
                            },
                        },
                    },
                },
            }),

            this.prisma.productDiscount.count({
                where,
            }),
        ]);

        const data: DiscountProductResponseDto[] = productDiscounts.map(
            ({ product }) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                images: product.images.map(({ imageUrl }) => imageUrl),
            }),
        );

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}
