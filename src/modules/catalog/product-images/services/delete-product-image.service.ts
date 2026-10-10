import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from "@/common/cloudinary/cloudinary.service";
@Injectable()
export class DeleteProductImageService {
    constructor(private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    async execute(imageId: string) {
        const image = await this.prisma.productImage.findUnique({
            where: {
                id: imageId,
            },
        });

        if (!image) {
            throw new NotFoundException('Product image not found');
        }

        await this.cloudinaryService.delete(image.publicId);

        return this.prisma.productImage.delete({
            where: {
                id: imageId,
            },
        });
    }
}
