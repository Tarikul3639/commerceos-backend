import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { UpdateProductImageDto } from '../../dto/requests/images/update-product-image.dto';

@Injectable()
export class UpdateProductImageService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    await this.prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.publicId !== undefined && { publicId: dto.publicId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }
}
