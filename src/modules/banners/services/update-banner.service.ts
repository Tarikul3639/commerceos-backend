import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

import { UpdateBannerDto } from '../dto/requests/update-banner.dto';
import { BannerResponseDto } from '../dto/responses/banner-response.dto';
import {
  bannerWithUsers,
  toBannerResponse,
} from '../dto/responses/banner-response.mapper';

@Injectable()
export class UpdateBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
        imagePublicId: true,
        mobileImagePublicId: true,
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

    const banner = await this.prisma.banner.update({
      where: {
        id: bannerId,
      },

      data: {
        updatedById: userId,
        ...(title !== undefined && {
          title: title.trim() || null,
        }),

        ...(imageUrl !== undefined && {
          imageUrl,
          imagePublicId,
        }),

        ...(mobileImageUrl !== undefined && {
          mobileImageUrl,
          mobileImagePublicId,
        }),

        ...(type !== undefined && {
          type,
        }),

        ...(position !== undefined && {
          position,
        }),

        ...(link !== undefined && {
          link: link?.trim() || null,
        }),

        ...(buttonText !== undefined && {
          buttonText: buttonText?.trim() || null,
        }),

        ...(openInNewTab !== undefined && { openInNewTab }),

        ...(sortOrder !== undefined && {
          sortOrder,
        }),

        ...(isActive !== undefined && {
          isActive,
        }),

        ...(startAt !== undefined && { startAt }),

        ...(endAt !== undefined && { endAt }),
      },
      include: bannerWithUsers,
    });

    await Promise.all(
      oldImageIds.map((publicId) => this.cloudinaryService.delete(publicId)),
    );

    return toBannerResponse(banner);
  }
}
