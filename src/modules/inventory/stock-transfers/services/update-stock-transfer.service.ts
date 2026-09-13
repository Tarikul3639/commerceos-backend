
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { StockTransferStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateStockTransferDto } from '../dto/requests/update-stock-transfer.dto';
import { StockTransferDetailResponseDto } from '../dto/responses/stock-transfer-detail-response.dto';

@Injectable()
export class UpdateStockTransferService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        stockTransferId: string,
        updateStockTransferDto: UpdateStockTransferDto,
    ): Promise<StockTransferDetailResponseDto> {
        const stockTransfer = await this.prisma.stockTransfer.findUnique({
            where: {
                id: stockTransferId,
            },

            select: {
                id: true,
                status: true,
                fromWarehouseId: true,
                toWarehouseId: true,
            },
        });

        if (!stockTransfer) {
            throw new NotFoundException('Stock transfer not found');
        }

        if (stockTransfer.status !== StockTransferStatus.PENDING) {
            throw new BadRequestException(
                'Only pending stock transfers can be updated',
            );
        }

        const { fromWarehouseId, toWarehouseId, items, notes } =
            updateStockTransferDto;

        const finalFromWarehouseId =
            fromWarehouseId ?? stockTransfer.fromWarehouseId;

        const finalToWarehouseId = toWarehouseId ?? stockTransfer.toWarehouseId;

        if (finalFromWarehouseId === finalToWarehouseId) {
            throw new BadRequestException(
                'Source and destination warehouses cannot be the same',
            );
        }

        /**
         * Validate warehouses only when changed
         */
        if (fromWarehouseId !== undefined || toWarehouseId !== undefined) {
            const [fromWarehouse, toWarehouse] = await Promise.all([
                this.prisma.warehouse.findFirst({
                    where: {
                        id: finalFromWarehouseId,
                        deletedAt: null,
                        isActive: true,
                    },

                    select: {
                        id: true,
                    },
                }),

                this.prisma.warehouse.findFirst({
                    where: {
                        id: finalToWarehouseId,
                        deletedAt: null,
                        isActive: true,
                    },

                    select: {
                        id: true,
                    },
                }),
            ]);

            if (!fromWarehouse) {
                throw new NotFoundException('Source warehouse not found or inactive');
            }

            if (!toWarehouse) {
                throw new NotFoundException(
                    'Destination warehouse not found or inactive',
                );
            }
        }

        /**
         * Validate variants when items are provided
         */
        if (items !== undefined) {
            const variantIds = items.map((item) => item.variantId);

            const uniqueVariantIds = new Set(variantIds);

            if (uniqueVariantIds.size !== variantIds.length) {
                throw new BadRequestException(
                    'Duplicate product variants are not allowed',
                );
            }

            const variants = await this.prisma.productVariant.findMany({
                where: {
                    id: {
                        in: variantIds,
                    },

                    deletedAt: null,

                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

            if (variants.length !== variantIds.length) {
                throw new NotFoundException(
                    'One or more product variants were not found or are inactive',
                );
            }
        }

        const updatedStockTransfer = await this.prisma.$transaction(async (tx) => {
            /**
             * Update transfer information
             */
            await tx.stockTransfer.update({
                where: {
                    id: stockTransferId,
                },

                data: {
                    ...(fromWarehouseId !== undefined && {
                        fromWarehouseId,
                    }),

                    ...(toWarehouseId !== undefined && {
                        toWarehouseId,
                    }),

                    ...(notes !== undefined && {
                        notes,
                    }),
                },
            });

            /**
             * Replace transfer items
             */
            if (items !== undefined) {
                await tx.stockTransferItem.deleteMany({
                    where: {
                        transferId: stockTransferId,
                    },
                });

                await tx.stockTransferItem.createMany({
                    data: items.map((item) => ({
                        transferId: stockTransferId,

                        variantId: item.variantId,

                        quantity: item.quantity,
                    })),
                });
            }

            return tx.stockTransfer.findUniqueOrThrow({
                where: {
                    id: stockTransferId,
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
                            email: true,
                        },
                    },

                    items: {
                        include: {
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
                        },
                    },
                },
            });
        });

        return updatedStockTransfer;
    }
}

