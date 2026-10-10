import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductDto } from '../../dto/requests/update-product.dto';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto';

@Injectable()
export class UpdateProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
        dto: UpdateProductDto,
    ): Promise<AdminProductDetailResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (dto.categoryId !== undefined) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
                select: { id: true },
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }
        }

        if (dto.brandId) {
            const brand = await this.prisma.brand.findUnique({
                where: { id: dto.brandId },
                select: { id: true },
            });

            if (!brand) {
                throw new NotFoundException('Brand not found');
            }
        }

        if (dto.sizeGuideId) {
            const sizeGuide = await this.prisma.sizeGuide.findUnique({
                where: { id: dto.sizeGuideId },
                select: { id: true },
            });

            if (!sizeGuide) {
                throw new NotFoundException('Size guide not found');
            }
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id: product.id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.subDescription !== undefined && {
                    subDescription: dto.subDescription,
                }),
                ...(dto.description !== undefined && {
                    description: dto.description,
                }),
                ...(dto.purchasePrice !== undefined && {
                    purchasePrice: dto.purchasePrice,
                }),
                ...(dto.sellingPrice !== undefined && {
                    sellingPrice: dto.sellingPrice,
                }),
                ...(dto.categoryId !== undefined && {
                    categoryId: dto.categoryId,
                }),
                ...(dto.brandId !== undefined && {
                    brandId: dto.brandId,
                }),
                ...(dto.sizeGuideId !== undefined && {
                    sizeGuideId: dto.sizeGuideId,
                }),
                ...(dto.status !== undefined && {
                    status: dto.status,
                }),
            },
            include: {
                images: {
                    orderBy: { sortOrder: 'asc' },
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
