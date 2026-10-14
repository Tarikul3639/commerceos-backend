
import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto';

@Injectable()
export class DeleteProductVariantService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        variantId: string,
    ): Promise<ProductVariantResponseDto> {
        return this.prisma.$transaction(async (tx) => {
            const variant = await tx.productVariant.findFirst({
                where: {
                    id: variantId,
                    // deletedAt: null,
                },
                include: {
                    cartItems: {
                        select: {
                            id: true,
                        },
                    },
                    orderItems: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!variant) {
                throw new NotFoundException(
                    'Product variant not found',
                );
            }

            // Check whether this variant has related option records.
            const hasRelations = variant.cartItems.length > 0 || variant.orderItems.length > 0;

            if (!hasRelations) {
                // Hard delete when no related option records exist.
                await tx.productVariant.delete({
                    where: {
                        id: variant.id,
                    },
                });

                return {
                    id: variant.id,
                    productId: variant.productId,
                    title: variant.title,
                    sku: variant.sku,
                    barcode: variant.barcode,
                    stock: variant.stock,
                    isActive: false,
                    deletedAt: null,
                    createdAt: variant.createdAt,
                    updatedAt: new Date(),
                    options: [],
                };
            }

            // Soft delete when related option records exist.
            const deletedVariant =
                await tx.productVariant.update({
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
        });
    }
}
