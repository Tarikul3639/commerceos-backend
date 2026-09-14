import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { BannerQueryDto } from '../dto/requests/banner-query.dto';
import { BannerResponseDto } from '../dto/responses/banner-response.dto';

import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetBannersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: BannerQueryDto,
    ): Promise<PaginatedResponse<BannerResponseDto>> {
        const { page = '1', limit = '10', type, position, isActive } = query;

        const currentPage = Math.max(Number(page), 1);
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.BannerWhereInput = {
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
            data: banners.map((banner) => ({
                id: banner.id,
                title: banner.title,
                imageUrl: banner.imageUrl,
                mobileImageUrl: banner.mobileImageUrl,
                type: banner.type,
                position: banner.position,
                link: banner.link,
                buttonText: banner.buttonText,
                sortOrder: banner.sortOrder,
                isActive: banner.isActive,
                startAt: banner.startAt,
                endAt: banner.endAt,
                createdAt: banner.createdAt,
                updatedAt: banner.updatedAt,
            })),

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
