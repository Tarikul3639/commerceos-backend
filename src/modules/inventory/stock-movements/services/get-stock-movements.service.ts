import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

import { PaginatedResponse } from '@/common/interfaces/paginated-response.interface';

import { StockMovementQueryDto } from '../dto/requests/stock-movement-query.dto';
import { StockMovementResponseDto } from '../dto/responses/stock-movement-response.dto';

@Injectable()
export class GetStockMovementsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: StockMovementQueryDto,
    ): Promise<PaginatedResponse<StockMovementResponseDto>> {
        const {
            variantId,
            warehouseId,
            userId,
            type,
            page = '1',
            limit = '10',
        } = query;

        const currentPage = Math.max(Number(page), 1);

        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const where: Prisma.StockMovementWhereInput = {
            ...(variantId && {
                variantId,
            }),

            ...(warehouseId && {
                warehouseId,
            }),

            ...(userId && {
                userId,
            }),

            ...(type && {
                type,
            }),
        };

        const [stockMovements, total] = await this.prisma.$transaction([
            this.prisma.stockMovement.findMany({
                where,

                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    previousQuantity: true,
                    currentQuantity: true,
                    reason: true,

                    variant: {
                        select: {
                            id: true,
                            sku: true,

                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                },
                            },
                        },
                    },

                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },

                    createdAt: true,
                },

                orderBy: {
                    createdAt: 'desc',
                },

                skip: (currentPage - 1) * pageSize,
                take: pageSize,
            }),

            this.prisma.stockMovement.count({
                where,
            }),
        ]);

        return {
            data: stockMovements as StockMovementResponseDto[],

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
