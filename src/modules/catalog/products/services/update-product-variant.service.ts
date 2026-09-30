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

        return this.prisma.productVariant.update({
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

                ...(dto.color !== undefined && { color: dto.color }),
                ...(dto.colorHex !== undefined && { colorHex: dto.colorHex }),
                ...(dto.size !== undefined && { size: dto.size }),

                ...(dto.isActive !== undefined && {
                    isActive: dto.isActive,
                }),
            },
        });
    }
}
