import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto';

@Injectable()
export class CreateProductVariantService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string, dto: CreateProductVariantDto) {
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

        if (dto.barcode) {
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
         */
        if (dto.attributeValueIds && dto.attributeValueIds.length > 0) {
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
             * Prevent multiple values
             * from the same attribute
             *
             * Example:
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

        return this.prisma.productVariant.create({
            data: {
                sku: dto.sku,

                ...(dto.image !== undefined && {
                    image: dto.image,
                }),

                ...(dto.publicId !== undefined && {
                    publicId: dto.publicId,
                }),

                ...(dto.barcode !== undefined && {
                    barcode: dto.barcode,
                }),

                purchasePrice: dto.purchasePrice,

                sellingPrice: dto.sellingPrice,

                ...(dto.isActive !== undefined && {
                    isActive: dto.isActive,
                }),

                productId,

                ...(dto.attributeValueIds &&
                    dto.attributeValueIds.length > 0 && {
                    attributeValues: {
                        create: dto.attributeValueIds.map((attributeValueId) => ({
                            attributeValue: {
                                connect: {
                                    id: attributeValueId,
                                },
                            },
                        })),
                    },
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
    }
}
