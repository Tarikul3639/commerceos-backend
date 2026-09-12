import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto';

@Injectable()
export class UpdateProductVariantService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
        variantId: string,
        dto: UpdateProductVariantDto,
    ) {
        const variant = await this.prisma.productVariant.findFirst({
            where: {
                id: variantId,
                productId,
                deletedAt: null,
            },

            select: {
                id: true,
                sku: true,
                barcode: true,
            },
        });

        if (!variant) {
            throw new NotFoundException('Product variant not found');
        }

        /**
         * Validate SKU
         */
        if (dto.sku !== undefined && dto.sku !== variant.sku) {
            const existingSku = await this.prisma.productVariant.findUnique({
                where: {
                    sku: dto.sku,
                },

                select: {
                    id: true,
                },
            });

            if (existingSku) {
                throw new ConflictException('SKU already exists');
            }
        }

        /**
         * Validate barcode
         */
        if (
            dto.barcode !== undefined &&
            dto.barcode !== null &&
            dto.barcode !== variant.barcode
        ) {
            const existingBarcode = await this.prisma.productVariant.findUnique({
                where: {
                    barcode: dto.barcode,
                },

                select: {
                    id: true,
                },
            });

            if (existingBarcode) {
                throw new ConflictException('Barcode already exists');
            }
        }

        /**
         * Validate attribute values
         *
         * undefined = don't update
         * [] = remove all
         */
        if (dto.attributeValueIds !== undefined) {
            if (dto.attributeValueIds.length > 0) {
                const attributeValues = await this.prisma.attributeValue.findMany({
                    where: {
                        id: {
                            in: dto.attributeValueIds,
                        },
                    },

                    select: {
                        id: true,
                        attributeId: true,
                    },
                });

                if (attributeValues.length !== dto.attributeValueIds.length) {
                    throw new NotFoundException('One or more attribute values not found');
                }

                /**
                 * Prevent:
                 *
                 * Color → Red
                 * Color → Blue ❌
                 */
                const attributeIds = attributeValues.map(
                    (attributeValue) => attributeValue.attributeId,
                );

                const uniqueAttributeIds = new Set(attributeIds);

                if (attributeIds.length !== uniqueAttributeIds.size) {
                    throw new ConflictException(
                        'Only one value can be selected for each attribute',
                    );
                }
            }
        }

        return this.prisma.$transaction(async (tx) => {
            /**
             * Replace attributes
             */
            if (dto.attributeValueIds !== undefined) {
                await tx.variantAttributeValue.deleteMany({
                    where: {
                        variantId,
                    },
                });

                if (dto.attributeValueIds.length > 0) {
                    await tx.variantAttributeValue.createMany({
                        data: dto.attributeValueIds.map((attributeValueId) => ({
                            variantId,
                            attributeValueId,
                        })),
                    });
                }
            }

            return tx.productVariant.update({
                where: {
                    id: variantId,
                },

                data: {
                    ...(dto.sku !== undefined && {
                        sku: dto.sku,
                    }),

                    ...(dto.image !== undefined && {
                        image: dto.image,
                    }),

                    ...(dto.publicId !== undefined && {
                        publicId: dto.publicId,
                    }),

                    /**
                     * null can remove barcode
                     */
                    ...(dto.barcode !== undefined && {
                        barcode: dto.barcode,
                    }),

                    ...(dto.purchasePrice !== undefined && {
                        purchasePrice: dto.purchasePrice,
                    }),

                    ...(dto.sellingPrice !== undefined && {
                        sellingPrice: dto.sellingPrice,
                    }),

                    ...(dto.isActive !== undefined && {
                        isActive: dto.isActive,
                    }),
                },

                include: {
                    attributeValues: {
                        include: {
                            attributeValue: {
                                include: {
                                    attribute: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
}
