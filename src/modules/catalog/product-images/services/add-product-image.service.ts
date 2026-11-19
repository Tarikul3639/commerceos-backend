import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { AddProductImageDto } from '../dto/requests/add-product-image.dto';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';

@Injectable()
export class AddProductImageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Add product images and attribute the change to the authenticated staff user.
   */
  async execute(
    productId: string,
    dto: AddProductImageDto,
    userId: string,
  ): Promise<ProductImageResponseDto[]> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const images = await this.prisma.$transaction(
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

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.PRODUCT,
      action: 'ADD_PRODUCT_IMAGES',
      description: `${images.length} images were added to product "${product.name}"`,
      entityType: 'Product',
      entityId: product.id,
      userId,
      newValue: images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        sortOrder: image.sortOrder,
      })),
    });

    return images;
  }
}
