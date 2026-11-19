import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service.js';

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
      imageUrl,
      imagePublicId,
      mobileImageUrl,
      mobileImagePublicId,
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

    if ((mobileImageUrl == null) !== (mobileImagePublicId == null)) {
      throw new BadRequestException(
        'Mobile image URL and public ID must be provided together',
      );
    }

    if (startAt && endAt && startAt > endAt) {
      throw new BadRequestException('End date must be after start date');
    }

    try {
      const banner = await this.prisma.$transaction(async (tx) => {
        const created = await tx.banner.create({
          data: {
            imageUrl,
            imagePublicId,
            type,
            position,
            createdById: userId,
            updatedById: userId,

            ...(title !== undefined && {
              title: title.trim() || null,
            }),

            ...(mobileImageUrl != null && {
              mobileImageUrl,
              mobileImagePublicId,
            }),

            ...(link !== undefined && {
              link: link.trim() || null,
            }),

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
              imagePublicId: created.imagePublicId,
              mobileImagePublicId: created.mobileImagePublicId,
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
      const uploadedIds = [imagePublicId, mobileImagePublicId].filter(
        (publicId): publicId is string => !!publicId,
      );
      await Promise.allSettled(
        uploadedIds.map((publicId) => this.cloudinaryService.delete(publicId)),
      );
      throw error;
    }
  }
}
