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

                ...(dto.color !== undefined && { color: dto.color }),
                ...(dto.colorHex !== undefined && { colorHex: dto.colorHex }),
                ...(dto.size !== undefined && { size: dto.size }),

                ...(dto.isActive !== undefined && {
                    isActive: dto.isActive,
                }),

                productId,
            },
        });
    }
}
