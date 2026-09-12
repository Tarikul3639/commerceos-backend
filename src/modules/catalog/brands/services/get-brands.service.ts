import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { BrandQueryDto } from '../dto/requests/brand-query.dto';
import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

@Injectable()
export class GetBrandsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: BrandQueryDto,
    ): Promise<PaginatedResponse<BrandResponseDto>> {
        const { search, isActive, page = '1', limit = '10' } = query;

        const currentPage = Math.max(Number(page) || 1, 1);

        const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const where = {
            deletedAt: null,

            ...(search?.trim() && {
                name: {
                    contains: search.trim(),
                    mode: 'insensitive' as const,
                },
            }),

            ...(isActive !== undefined && {
                isActive: isActive === 'true',
            }),
        };

        const [brands, total] = await this.prisma.$transaction([
            this.prisma.brand.findMany({
                where,

                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip: (currentPage - 1) * pageSize,

                take: pageSize,
            }),

            this.prisma.brand.count({
                where,
            }),
        ]);

        return {
            data: brands,
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
