import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { BannerQueryDto } from '@/modules/banners/dto/requests/banner-query.dto';
import { BannerResponseDto } from '@/modules/banners/dto/responses/banner-response.dto';
import {
  bannerWithUsers,
  toBannerResponse,
} from '@/modules/banners/dto/responses/banner-response.mapper';

import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';

@Injectable()
export class GetBannersService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: BannerQueryDto,
  ): Promise<PaginatedResponse<BannerResponseDto>> {
    const {
      page = '1',
      limit = '10',
      search,
      type,
      position,
      isActive,
    } = query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);

    const where: Prisma.BannerWhereInput = {
      ...(search?.trim() && {
        title: {
          contains: search.trim(),
          mode: 'insensitive',
        },
      }),
      ...(type && {
        type,
      }),

      ...(position && {
        position,
      }),

      ...(isActive !== undefined && {
        isActive,
      }),
    };

    const [banners, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        include: bannerWithUsers,

        orderBy: [
          {
            sortOrder: 'asc',
          },

          {
            createdAt: 'desc',
          },
        ],
      }),

      this.prisma.banner.count({
        where,
      }),
    ]);

    return {
      data: banners.map(toBannerResponse),

      meta: {
        total,
        page: currentPage,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: currentPage * pageSize < total,
        hasPreviousPage: currentPage > 1,
      },
    };
  }
}
