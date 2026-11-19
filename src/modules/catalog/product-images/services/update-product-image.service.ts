import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service.js';
import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../lib/prisma/client.js';

import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto.js';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto.js';

@Injectable()
export class UpdateProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Update a product image while keeping its URL and Cloudinary ID in sync.
   */
  async execute(
    imageId: string,
    dto: UpdateProductImageDto,
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

    const { imageUrl, publicId, sortOrder } = dto;

    if ((imageUrl !== undefined) !== (publicId !== undefined)) {
      throw new BadRequestException(
        'Image URL and Cloudinary public ID must be updated together',
      );
    }

    const isReplacingImage =
      imageUrl !== undefined &&
      publicId !== undefined &&
      publicId !== image.publicId;

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

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'UPDATE_PRODUCT_IMAGE',
      description: 'A product image was updated',
      entityType: 'ProductImage',
      entityId: image.id,
      userId,
      oldValue: {
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        sortOrder: image.sortOrder,
      },
      newValue: {
        imageUrl: updatedImage.imageUrl,
        publicId: updatedImage.publicId,
        sortOrder: updatedImage.sortOrder,
      },
    });

    if (isReplacingImage) {
      await this.cloudinaryService.delete(image.publicId);
    }

    return updatedImage;
  }
}
