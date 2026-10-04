import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { BannerResponseDto } from '@/modules/banners/dto/responses/banner-response.dto';
import {
  bannerWithUsers,
  toBannerResponse,
} from '@/modules/banners/dto/responses/banner-response.mapper';

@Injectable()
export class GetBannerService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(bannerId: string): Promise<BannerResponseDto> {
    const banner = await this.prisma.banner.findUnique({
      where: {
        id: bannerId,
      },
      include: bannerWithUsers,
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return toBannerResponse(banner);
  }
}
