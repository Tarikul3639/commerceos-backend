import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductDto } from '../../dto/requests/create-product.dto';
import { AdminProductDetailResponseDto } from '../../dto/responses/admin-product-detail-response.dto';

@Injectable()
export class CreateProductService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(dto: CreateProductDto): Promise<AdminProductDetailResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
            select: { id: true },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
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

        const product = await this.prisma.product.create({
            data: {
                name: dto.name,
                ...(dto.subDescription !== undefined && {
                    subDescription: dto.subDescription,
                }),
                ...(dto.description !== undefined && {
                    description: dto.description,
                }),
                purchasePrice: dto.purchasePrice,
                sellingPrice: dto.sellingPrice,
                categoryId: category.id,
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
            ...product,
            purchasePrice: product.purchasePrice.toString(),
            sellingPrice: product.sellingPrice.toString(),
        };
    }
}
