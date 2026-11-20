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
      where: { id: bannerId },
      include: { images: true },
    });

    if (!existingBanner) {
      throw new NotFoundException('Banner not found');
    }

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
    } = updateBannerDto;

    const nextStartAt =
      startAt === undefined ? existingBanner.startAt : startAt;
    const nextEndAt = endAt === undefined ? existingBanner.endAt : endAt;
    if (nextStartAt && nextEndAt && nextStartAt > nextEndAt) {
      throw new BadRequestException('End date must be after start date');
    }

    const orderedImages = images
      ? [...images]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((image, index) => ({ ...image, sortOrder: index }))
      : undefined;
    if (orderedImages && orderedImages.length === 0) {
      throw new BadRequestException('At least one banner image is required');
    }

    const previousPublicIds = existingBanner.images.map(
      (image) => image.publicId,
    );
    const legacyPublicIds = [
      existingBanner.imagePublicId,
      existingBanner.mobileImagePublicId,
    ].filter((publicId): publicId is string => !!publicId);
    const nextPublicIds = new Set(
      orderedImages?.map((image) => image.publicId) ?? previousPublicIds,
    );
    const removedPublicIds = [
      ...new Set([...previousPublicIds, ...legacyPublicIds]),
    ].filter((publicId) => !nextPublicIds.has(publicId));
    const primaryImage = orderedImages?.[0];

    const banner = await this.prisma.$transaction(async (tx) => {
      if (orderedImages) {
        await tx.bannerImage.deleteMany({ where: { bannerId } });
      }

      const updated = await tx.banner.update({
        where: { id: bannerId },
        data: {
          updatedById: userId,
          ...(title !== undefined && { title: title.trim() || null }),
          ...(orderedImages && {
            imageUrl: primaryImage!.imageUrl,
            imagePublicId: primaryImage!.publicId,
            images: { create: orderedImages },
            mobileImageUrl: null,
            mobileImagePublicId: null,
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
            imagePublicIds: existingBanner.images.map(
              (image) => image.publicId,
            ),
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
            imagePublicIds: updated.images.map((image) => image.publicId),
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
      removedPublicIds.map((publicId) =>
        this.cloudinaryService.delete(publicId),
      ),
    );
    return toBannerResponse(banner);
  }
}
