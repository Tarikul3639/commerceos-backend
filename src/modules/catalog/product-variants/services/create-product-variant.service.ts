import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class CreateProductVariantService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        dto: CreateProductVariantDto,
    ): Promise<ProductVariantResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: dto.productId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existingSku = await this.prisma.productVariant.findUnique({
            where: { sku: dto.sku },
            select: { id: true },
        });

        if (existingSku) {
            throw new ConflictException('SKU already exists');
        }

        if (dto.barcode) {
            const existingBarcode = await this.prisma.productVariant.findUnique({
                where: { barcode: dto.barcode },
                select: { id: true },
            });

            if (existingBarcode) {
                throw new ConflictException('Barcode already exists');
            }
        }

        const optionValueIds = dto.optionValueIds ?? [];

        if (optionValueIds.length > 0) {
            const optionValues = await this.prisma.productOptionValue.findMany({
                where: {
                    id: { in: optionValueIds },
                    option: {
                        productId: product.id,
                    },
                },
                select: { id: true },
            });

            if (optionValues.length !== optionValueIds.length) {
                throw new BadRequestException(
                    'One or more option values are invalid for this product',
                );
            }
        }

        const variant = await this.prisma.productVariant.create({
            data: {
                productId: product.id,
                ...(dto.title !== undefined && {
                    title: dto.title,
                }),
                sku: dto.sku,
                ...(dto.barcode !== undefined && {
                    barcode: dto.barcode,
                }),
                stock: dto.stock ?? 0,
                ...(optionValueIds.length > 0 && {
                    options: {
                        connect: optionValueIds.map((id) => ({ id })),
                    },
                }),
            },
            include: {
                options: {
                    include: {
                        option: true,
                    },
                },
            },
        });

        return {
            id: variant.id,
            productId: variant.productId,
            title: variant.title,
            sku: variant.sku,
            barcode: variant.barcode,
            stock: variant.stock,
            isActive: variant.isActive,
            deletedAt: variant.deletedAt,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt,
            options: variant.options.map((value) => ({
                id: value.id,
                value: value.value,
                colorHex: value.colorHex,
                optionId: value.optionId,
                optionName: value.option.name,
                optionType: value.option.type,
            })),
        };
    }
}
