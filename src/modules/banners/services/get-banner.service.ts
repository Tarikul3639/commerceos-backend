import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';

import { BannerResponseDto } from '../dto/responses/banner-response.dto.js';
import {
  bannerWithUsers,
  toBannerResponse,
} from '../dto/responses/banner-response.mapper.js';

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
