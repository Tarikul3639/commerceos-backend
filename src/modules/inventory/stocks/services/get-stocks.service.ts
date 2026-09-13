import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../../lib/prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';

import { StockQueryDto } from '../dto/requests/stock-query.dto';
import { StockResponseDto } from '../dto/responses/stock-response.dto';

import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetStocksService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: StockQueryDto,
    ): Promise<PaginatedResponse<StockResponseDto>> {
        const {
            warehouseId,
            variantId,
            search,
            lowStock,
            page = '1',
            limit = '10',
        } = query;

        // Validate and parse pagination parameters
        const currentPage = Math.max(Number(page), 1);
        // Limit the page size to a maximum of 100 and a minimum of 1
        const pageSize = Math.min(Math.max(Number(limit), 1), 100);

        // Build the where clause for filtering stocks based on the provided query parameters
        const where: Prisma.InventoryWhereInput = {
            ...(warehouseId !== undefined && {
                warehouseId,
            }),

            ...(variantId !== undefined && {
                variantId,
            }),

            variant: {
                deletedAt: null,
                isActive: true,

                ...(search && {
                    OR: [
                        {
                            sku: {
                                contains: search.trim(),
                                mode: 'insensitive',
                            },
                        },

                        {
                            product: {
                                name: {
                                    contains: search.trim(),
                                    mode: 'insensitive',
                                },
                            },
                        },
                    ],
                }),
            },

            warehouse: {
                deletedAt: null,
                isActive: true,
            },
        };

        const [inventories, total] = await this.prisma.$transaction([
            this.prisma.inventory.findMany({
                where,

                select: {
                    id: true,

                    quantity: true,
                    reservedQuantity: true,

                    variantId: true,
                    warehouseId: true,

                    createdAt: true,
                    updatedAt: true,

                    variant: {
                        select: {
                            sku: true,

                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },

                    warehouse: {
                        select: {
                            name: true,
                        },
                    },
                },

                orderBy: {
                    updatedAt: 'desc',
                },

                skip: (currentPage - 1) * pageSize,
                take: pageSize,
            }),

            this.prisma.inventory.count({
                where,
            }),
        ]);

        /**
         * Low stock filtering.
         *
         * Currently this requires minimumStock
         * to exist on ProductVariant.
         */
        let filteredInventories = inventories;

        if (lowStock === 'true') {
            /**
             * Implement this after adding
             * minimumStock to ProductVariant.
             */
        }

        return {
            data: filteredInventories.map((inventory) => ({
                id: inventory.id,

                quantity: inventory.quantity,
                reservedQuantity: inventory.reservedQuantity,
                availableQuantity: inventory.quantity - inventory.reservedQuantity,
                variantId: inventory.variantId,
                sku: inventory.variant.sku,

                productId: inventory.variant.product.id,
                productName: inventory.variant.product.name,
                warehouseId: inventory.warehouseId,
                warehouseName: inventory.warehouse.name,

                createdAt: inventory.createdAt,
                updatedAt: inventory.updatedAt,
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
