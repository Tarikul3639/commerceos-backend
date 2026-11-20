import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { CloudinaryService } from '../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';

import { CreateBannerDto } from '../dto/requests/create-banner.dto.js';
import { BannerResponseDto } from '../dto/responses/banner-response.dto.js';
import {
  bannerWithUsers,
  toBannerResponse,
} from '../dto/responses/banner-response.mapper.js';

@Injectable()
export class CreateBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    userId: string,
    createBannerDto: CreateBannerDto,
  ): Promise<BannerResponseDto> {
    const {
      title,
      images,
      type,
      position,
      link,
      buttonText,
      openInNewTab,
      sortOrder,
      isActive,
      startAt,
      endAt,
    } = createBannerDto;

    if (!images?.length) {
      throw new BadRequestException('At least one banner image is required');
    }
    if (startAt && endAt && startAt > endAt) {
      throw new BadRequestException('End date must be after start date');
    }

    const orderedImages = [...images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image, index) => ({ ...image, sortOrder: index }));
    const primaryImage = orderedImages[0];

    try {
      const banner = await this.prisma.$transaction(async (tx) => {
        const created = await tx.banner.create({
          data: {
            imageUrl: primaryImage.imageUrl,
            imagePublicId: primaryImage.publicId,
            images: { create: orderedImages },
            type,
            position,
            createdById: userId,
            updatedById: userId,
            ...(title !== undefined && { title: title.trim() || null }),
            ...(link !== undefined && { link: link.trim() || null }),
            ...(buttonText !== undefined && {
              buttonText: buttonText.trim() || null,
            }),
            ...(openInNewTab !== undefined && { openInNewTab }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isActive !== undefined && { isActive }),
            ...(startAt !== undefined && { startAt }),
            ...(endAt !== undefined && { endAt }),
          },
          include: bannerWithUsers,
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.CREATE,
            module: ActivityModule.OTHER,
            action: 'CREATE_BANNER',
            entityType: 'Banner',
            entityId: created.id,
            userId,
            newValue: {
              title: created.title,
              imagePublicIds: orderedImages.map((image) => image.publicId),
              type: created.type,
              position: created.position,
              isActive: created.isActive,
              sortOrder: created.sortOrder,
              startAt: created.startAt,
              endAt: created.endAt,
            },
          },
          tx,
        );
        return created;
      });

      return toBannerResponse(banner);
    } catch (error) {
      await Promise.allSettled(
        orderedImages.map((image) =>
          this.cloudinaryService.delete(image.publicId),
        ),
      );
      throw error;
    }
  }
}
