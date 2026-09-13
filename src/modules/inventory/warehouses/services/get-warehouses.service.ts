import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../../lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';

import { WarehouseQueryDto } from '../dto/requests/warehouse-query.dto';
import { WarehouseResponseDto } from '../dto/responses/warehouse-response.dto';

import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetWarehousesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: WarehouseQueryDto,
    ): Promise<PaginatedResponse<WarehouseResponseDto>> {
        const { search, isActive, page = '1', limit = '10' } = query;

        // Minimum page 1
        const currentPage = Math.max(Number(page), 1);
        // Minimum limit 1 and Maximum 100
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);
        // Filter & Query
        const where: Prisma.WarehouseWhereInput = {
            deletedAt: null,
            ...(search && {
                name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                },
                ...(isActive !== undefined && {
                    isActive: isActive === 'true',
                }),
            }),
        };

        const [warehouses, total] = await this.prisma.$transaction([
            this.prisma.warehouse.findMany({
                where,

                select: {
                    id: true,
                    name: true,
                    address: true,
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

            this.prisma.warehouse.count({
                where,
            }),
        ]);

        return {
            data: warehouses as WarehouseResponseDto[],

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
