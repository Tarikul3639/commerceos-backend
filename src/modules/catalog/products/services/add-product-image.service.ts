import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { AddProductImageDto } from '../dto/requests/add-product-image.dto';

@Injectable()
export class AddProductImageService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string, dto: AddProductImageDto) {
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

        const existingImage = await this.prisma.productImage.findUnique({
            where: {
                publicId: dto.publicId,
            },

            select: {
                id: true,
            },
        });

        if (existingImage) {
            throw new ConflictException('Product image already exists');
        }

        return this.prisma.productImage.create({
            data: {
                imageUrl: dto.imageUrl,
                publicId: dto.publicId,

                ...(dto.sortOrder !== undefined && {
                    sortOrder: dto.sortOrder,
                }),

                productId,
            },
        });
    }
}
