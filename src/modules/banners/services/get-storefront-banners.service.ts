import { Injectable } from '@nestjs/common';

import { BannerPosition } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

import { StorefrontBannerItemResponseDto } from '../dto/responses/storefront-banner-response.dto.js';

@Injectable()
export class GetStorefrontBannersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns currently visible banners for one requested placement.
   * Results are ordered by sortOrder, then newest creation time.
   */
  async execute(
    position: BannerPosition,
  ): Promise<StorefrontBannerItemResponseDto[]> {
    const now = new Date();

    return this.prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      select: {
        id: true,
        imageUrl: true,
        mobileImageUrl: true,
        type: true,
        position: true,
        link: true,
        openInNewTab: true,
        sortOrder: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }
}
