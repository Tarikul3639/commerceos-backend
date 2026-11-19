import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CloudinaryService } from '../../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../infrastructure/database/generated/prisma/client.js';

import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto.js';

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
