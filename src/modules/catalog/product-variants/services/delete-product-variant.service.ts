import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class DeleteProductVariantService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        variantId: string,
    ): Promise<ProductVariantResponseDto> {
        const variant = await this.prisma.productVariant.findFirst({
            where: {
                id: variantId,
                deletedAt: null,
            },
            select: {
                id: true,
            },
        });

        if (!variant) {
            throw new NotFoundException('Product variant not found');
        }

        const deletedVariant = await this.prisma.productVariant.update({
            where: {
                id: variant.id,
            },
            data: {
                isActive: false,
                deletedAt: new Date(),
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
            id: deletedVariant.id,
            productId: deletedVariant.productId,
            title: deletedVariant.title,
            sku: deletedVariant.sku,
            barcode: deletedVariant.barcode,
            stock: deletedVariant.stock,
            isActive: deletedVariant.isActive,
            deletedAt: deletedVariant.deletedAt,
            createdAt: deletedVariant.createdAt,
            updatedAt: deletedVariant.updatedAt,
            options: deletedVariant.options.map((value) => ({
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