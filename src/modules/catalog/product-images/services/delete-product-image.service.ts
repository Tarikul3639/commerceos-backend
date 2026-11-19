import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';

@Injectable()
export class DeleteProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Remove a product image and record the authenticated staff actor.
   */
  async execute(
    imageId: string,
    userId: string,
  ): Promise<ProductImageResponseDto> {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        product: {
          deletedAt: null,
        },
      },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    const deletedImage = await this.prisma.productImage.delete({
      where: {
        id: imageId,
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.PRODUCT,
      action: 'DELETE_PRODUCT_IMAGE',
      description: 'A product image was deleted',
      entityType: 'ProductImage',
      entityId: image.id,
      userId,
      oldValue: {
        productId: image.productId,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        sortOrder: image.sortOrder,
      },
      newValue: 'Product image deleted',
    });

    await this.cloudinaryService.delete(image.publicId);

    return deletedImage;
  }
}
