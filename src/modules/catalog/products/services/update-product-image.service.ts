import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto';

@Injectable()
export class UpdateProductImageService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        productId: string,
        imageId: string,
        dto: UpdateProductImageDto,
    ) {
        const image = await this.prisma.productImage.findFirst({
            where: {
                id: imageId,
                productId,
            },

            select: {
                id: true,
                publicId: true,
            },
        });

        if (!image) {
            throw new NotFoundException('Product image not found');
        }

        if (dto.publicId !== undefined && dto.publicId !== image.publicId) {
            const existingImage = await this.prisma.productImage.findUnique({
                where: {
                    publicId: dto.publicId,
                },

                select: {
                    id: true,
                },
            });

            if (existingImage) {
                throw new ConflictException('Image public ID already exists');
            }
        }

        return this.prisma.productImage.update({
            where: {
                id: imageId,
            },

            data: {
                ...(dto.imageUrl !== undefined && {
                    imageUrl: dto.imageUrl,
                }),

                ...(dto.publicId !== undefined && {
                    publicId: dto.publicId,
                }),

                ...(dto.sortOrder !== undefined && {
                    sortOrder: dto.sortOrder,
                }),
            },
        });
    }
}
