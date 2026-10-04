import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

import { CreateBannerDto } from '@/modules/banners/dto/requests/create-banner.dto';
import { BannerResponseDto } from '@/modules/banners/dto/responses/banner-response.dto';
import {
  bannerWithUsers,
  toBannerResponse,
} from '@/modules/banners/dto/responses/banner-response.mapper';

@Injectable()
export class CreateBannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
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
      const banner = await this.prisma.banner.create({
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
