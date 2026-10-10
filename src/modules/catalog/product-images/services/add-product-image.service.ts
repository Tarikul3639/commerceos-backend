import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { AddProductImageDto } from '../dto/requests/add-product-image.dto';

@Injectable()
export class AddProductImageService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(dto: AddProductImageDto) {
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

        return this.prisma.$transaction(
            dto.images.map((image) =>
                this.prisma.productImage.create({
                    data: {
                        productId: product.id,
                        imageUrl: image.imageUrl,
                        publicId: image.publicId,
                        sortOrder: image.sortOrder,
                    },
                }),
            ),
        );
    }
}
