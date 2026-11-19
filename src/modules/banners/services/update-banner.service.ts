import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { CloudinaryService } from '../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';

import { UpdateBannerDto } from '../dto/requests/update-banner.dto.js';
import { BannerResponseDto } from '../dto/responses/banner-response.dto.js';
import {
  bannerWithUsers,
  toBannerResponse,
} from '../dto/responses/banner-response.mapper.js';

@Injectable()
export class UpdateBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    bannerId: string,
    userId: string,
    updateBannerDto: UpdateBannerDto,
  ): Promise<BannerResponseDto> {
    const existingBanner = await this.prisma.banner.findUnique({
      where: {
        id: bannerId,
      },
      select: {
        id: true,
        title: true,
        imagePublicId: true,
        mobileImagePublicId: true,
        type: true,
        position: true,
        link: true,
        buttonText: true,
        isActive: true,
        sortOrder: true,
        startAt: true,
        endAt: true,
      },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

    const {
      title,
      imageUrl,
      mobileImageUrl,
      imagePublicId,
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
    } = updateBannerDto;

    if ((imageUrl === undefined) !== (imagePublicId === undefined)) {
      throw new BadRequestException(
        'Desktop image URL and public ID must be updated together',
      );
    }

    if (
      (mobileImageUrl === undefined) !==
      (mobileImagePublicId === undefined)
    ) {
      throw new BadRequestException(
        'Mobile image URL and public ID must be updated together',
      );
    }

    const nextStartAt =
      startAt === undefined ? existingBanner.startAt : startAt;
    const nextEndAt = endAt === undefined ? existingBanner.endAt : endAt;
    if (nextStartAt && nextEndAt && nextStartAt > nextEndAt) {
      throw new BadRequestException('End date must be after start date');
    }

    const oldImageIds = [
      imagePublicId && imagePublicId !== existingBanner.imagePublicId
        ? existingBanner.imagePublicId
        : null,
      mobileImagePublicId &&
      mobileImagePublicId !== existingBanner.mobileImagePublicId
        ? existingBanner.mobileImagePublicId
        : null,
      mobileImageUrl === null ? existingBanner.mobileImagePublicId : null,
    ].filter((publicId): publicId is string => !!publicId);

    const banner = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.banner.update({
        where: { id: bannerId },
        data: {
          updatedById: userId,
          ...(title !== undefined && { title: title.trim() || null }),
          ...(imageUrl !== undefined && { imageUrl, imagePublicId }),
          ...(mobileImageUrl !== undefined && {
            mobileImageUrl,
            mobileImagePublicId,
          }),
          ...(type !== undefined && { type }),
          ...(position !== undefined && { position }),
          ...(link !== undefined && { link: link?.trim() || null }),
          ...(buttonText !== undefined && {
            buttonText: buttonText?.trim() || null,
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
          type: ActivityType.UPDATE,
          module: ActivityModule.OTHER,
          action: 'UPDATE_BANNER',
          entityType: 'Banner',
          entityId: updated.id,
          userId,
          oldValue: {
            title: existingBanner.title,
            imagePublicId: existingBanner.imagePublicId,
            mobileImagePublicId: existingBanner.mobileImagePublicId,
            type: existingBanner.type,
            position: existingBanner.position,
            link: existingBanner.link,
            buttonText: existingBanner.buttonText,
            isActive: existingBanner.isActive,
            sortOrder: existingBanner.sortOrder,
            startAt: existingBanner.startAt,
            endAt: existingBanner.endAt,
          },
          newValue: {
            title: updated.title,
            imagePublicId: updated.imagePublicId,
            mobileImagePublicId: updated.mobileImagePublicId,
            type: updated.type,
            position: updated.position,
            link: updated.link,
            buttonText: updated.buttonText,
            isActive: updated.isActive,
            sortOrder: updated.sortOrder,
            startAt: updated.startAt,
            endAt: updated.endAt,
          },
        },
        tx,
      );
      return updated;
    });

    await Promise.all(
      oldImageIds.map((publicId) => this.cloudinaryService.delete(publicId)),
    );
    return toBannerResponse(banner);
  }
}
