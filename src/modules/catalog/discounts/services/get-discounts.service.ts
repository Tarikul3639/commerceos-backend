import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

import { DiscountQueryDto } from '../dto/requests/discount-query.dto';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto';
import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetDiscountsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: DiscountQueryDto,
    ): Promise<PaginatedResponse<DiscountResponseDto>> {
        const { search, type, isActive, page = '1', limit = '10' } = query;

        const currentPage = Math.max(Number(page), 1);

        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where = {
            deletedAt: null,

            ...(search && {
                name: {
                    contains: search.trim(),
                    mode: 'insensitive' as const,
                },
            }),

            ...(type && {
                type,
            }),

            ...(isActive !== undefined && {
                isActive: isActive === 'true',
            }),
        };

        const [discounts, total] = await this.prisma.$transaction([
            this.prisma.discount.findMany({
                where,

                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    value: true,
                    startDate: true,
                    endDate: true,
                    isActive: true,
                    createdById: true,
                    createdAt: true,
                    updatedAt: true,
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip: (currentPage - 1) * pageSize,

                take: pageSize,
            }),

            this.prisma.discount.count({
                where,
            }),
        ]);

        return {
            data: discounts.map((discount) => ({
                ...discount,
                value: discount.value.toString(),
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
