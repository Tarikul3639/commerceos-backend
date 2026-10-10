import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class GetProductVariantsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
    ): Promise<ProductVariantResponseDto[]> {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const variants = await this.prisma.productVariant.findMany({
            where: {
                productId: product.id,
                deletedAt: null,
            },
            include: {
                options: {
                    include: {
                        option: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return variants.map((variant) => ({
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
        }));
    }
}