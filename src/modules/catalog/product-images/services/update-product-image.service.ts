import { Injectable, NotFoundException } from '@nestjs/common';

import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';

@Injectable()
export class UpdateProductImageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async execute(
        imageId: string,
        dto: UpdateProductImageDto,
    ): Promise<ProductImageResponseDto> {
        const image = await this.prisma.productImage.findUnique({
            where: {
                id: imageId,
            },
        });

        if (!image) {
            throw new NotFoundException('Product image not found');
        }

        const { imageUrl, publicId, sortOrder } = dto;

        const isReplacingImage =
            Boolean(imageUrl) && Boolean(publicId) && publicId !== image.publicId;

        const updatedImage = await this.prisma.productImage.update({
            where: {
                id: imageId,
            },
            data: {
                ...(imageUrl !== undefined && { imageUrl }),
                ...(publicId !== undefined && { publicId }),
                ...(sortOrder !== undefined && { sortOrder }),
            },
        });

        if (isReplacingImage) {
            await this.cloudinaryService.delete(image.publicId);
        }

        return updatedImage;
    }
}
