import { Injectable } from '@nestjs/common';

import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';

import { StockTransferQueryDto } from '../dto/requests/stock-transfer-query.dto';
import { StockTransferResponseDto } from '../dto/responses/stock-transfer-response.dto';

import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetStockTransfersService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: StockTransferQueryDto,
    ): Promise<PaginatedResponse<StockTransferResponseDto>> {
        const {
            page = 1,
            limit = 10,
            status,
            fromWarehouseId,
            toWarehouseId,
            userId,
        } = query;

        const currentPage = Math.max(Number(page), 1);

        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        const skip = (currentPage - 1) * pageSize;

        const where: Prisma.StockTransferWhereInput = {
            ...(status !== undefined && {
                status,
            }),

            ...(fromWarehouseId && {
                fromWarehouseId,
            }),

            ...(toWarehouseId && {
                toWarehouseId,
            }),

            ...(userId && {
                userId,
            }),
        };

        const [stockTransfers, total] = await this.prisma.$transaction([
            this.prisma.stockTransfer.findMany({
                where,

                skip,

                take: pageSize,

                orderBy: {
                    createdAt: 'desc',
                },

                include: {
                    fromWarehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    toWarehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    _count: {
                        select: {
                            items: true,
                        },
                    },
                },
            }),

            this.prisma.stockTransfer.count({
                where,
            }),
        ]);

        const data: StockTransferResponseDto[] = stockTransfers.map(
            (stockTransfer) => ({
                id: stockTransfer.id,
                transferNo: stockTransfer.transferNo,
                status: stockTransfer.status,
                notes: stockTransfer.notes,
                fromWarehouseId: stockTransfer.fromWarehouse.id,
                fromWarehouseName: stockTransfer.fromWarehouse.name,
                toWarehouseId: stockTransfer.toWarehouse.id,
                toWarehouseName: stockTransfer.toWarehouse.name,
                totalItems: stockTransfer._count.items,
                userId: stockTransfer.user.id,
                userName: stockTransfer.user.name,
                createdAt: stockTransfer.createdAt,
                updatedAt: stockTransfer.updatedAt,
            }),
        );

        return {
            data,

            meta: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNextPage: currentPage * pageSize < total,
                hasPreviousPage: currentPage > 1,
            },
        };
    }
}
