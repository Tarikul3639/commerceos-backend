import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteProductImageService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(productId: string, imageId: string): Promise<void> {
        const image = await this.prisma.productImage.findFirst({
            where: {
                id: imageId,
                productId,
            },

            select: {
                id: true,
            },
        });

        if (!image) {
            throw new NotFoundException('Product image not found');
        }

        await this.prisma.productImage.delete({
            where: {
                id: imageId,
            },
        });
    }
}
