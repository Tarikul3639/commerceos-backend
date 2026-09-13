import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    Prisma,
    StockMovementType,
    StockTransferStatus,
} from '@/lib/prisma/client';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateStockTransferStatusDto } from '../dto/requests/update-stock-transfer-status.dto';
import { StockTransferDetailResponseDto } from '../dto/responses/stock-transfer-detail-response.dto';

@Injectable()
export class UpdateStockTransferStatusService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        stockTransferId: string,
        updateStockTransferStatusDto: UpdateStockTransferStatusDto,
    ): Promise<StockTransferDetailResponseDto> {
        const { status } = updateStockTransferStatusDto;

        const stockTransfer = await this.prisma.stockTransfer.findUnique({
            where: {
                id: stockTransferId,
            },

            include: {
                items: true,
            },
        });

        if (!stockTransfer) {
            throw new NotFoundException('Stock transfer not found');
        }

        /**
         * Only pending transfers can change status
         */
        if (stockTransfer.status !== StockTransferStatus.PENDING) {
            throw new BadRequestException(
                'Only pending stock transfers can change status',
            );
        }

        /**
         * Cannot change PENDING to PENDING
         */
        if (status === StockTransferStatus.PENDING) {
            throw new BadRequestException('Stock transfer is already pending');
        }

        /**
         * CANCELLED
         *
         * No stock changes required.
         */
        if (status === StockTransferStatus.CANCELLED) {
            const updated = await this.prisma.stockTransfer.update({
                where: {
                    id: stockTransferId,
                },

                data: {
                    status: StockTransferStatus.CANCELLED,
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

            return updated;
        }

        /**
         * Only COMPLETED is allowed here
         */
        if (status !== StockTransferStatus.COMPLETED) {
            throw new BadRequestException('Invalid stock transfer status');
        }

        /**
         * Complete transfer atomically
         */
        const completedTransfer = await this.prisma.$transaction(async (tx) => {
            for (const item of stockTransfer.items) {
                /**
                 * SOURCE INVENTORY
                 */
                const sourceInventory = await tx.inventory.findUnique({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: stockTransfer.fromWarehouseId,
                        },
                    },
                });

                if (!sourceInventory) {
                    throw new BadRequestException(
                        'Insufficient stock in source warehouse',
                    );
                }

                /**
                 * Available stock
                 */
                const availableQuantity =
                    sourceInventory.quantity - sourceInventory.reservedQuantity;

                if (availableQuantity < item.quantity) {
                    throw new BadRequestException(
                        'Insufficient available stock in source warehouse',
                    );
                }

                const previousSourceQuantity = sourceInventory.quantity;

                const currentSourceQuantity = previousSourceQuantity - item.quantity;

                /**
                 * Decrease source stock
                 */
                await tx.inventory.update({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: stockTransfer.fromWarehouseId,
                        },
                    },

                    data: {
                        quantity: {
                            decrement: item.quantity,
                        },
                    },
                });

                /**
                 * Create TRANSFER_OUT movement
                 */
                await tx.stockMovement.create({
                    data: {
                        type: StockMovementType.TRANSFER_OUT,

                        quantity: -item.quantity,

                        previousQuantity: previousSourceQuantity,

                        currentQuantity: currentSourceQuantity,

                        reason: `Stock transfer ${stockTransfer.transferNo}`,

                        variantId: item.variantId,

                        warehouseId: stockTransfer.fromWarehouseId,

                        userId: stockTransfer.userId,
                    },
                });

                /**
                 * DESTINATION INVENTORY
                 */
                const destinationInventory = await tx.inventory.findUnique({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: stockTransfer.toWarehouseId,
                        },
                    },
                });

                const previousDestinationQuantity = destinationInventory?.quantity ?? 0;

                const currentDestinationQuantity =
                    previousDestinationQuantity + item.quantity;

                /**
                 * Increase destination stock
                 */
                await tx.inventory.upsert({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: stockTransfer.toWarehouseId,
                        },
                    },

                    update: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },

                    create: {
                        variantId: item.variantId,

                        warehouseId: stockTransfer.toWarehouseId,

                        quantity: item.quantity,

                        reservedQuantity: 0,
                    },
                });

                /**
                 * Create TRANSFER_IN movement
                 */
                await tx.stockMovement.create({
                    data: {
                        type: StockMovementType.TRANSFER_IN,
                        quantity: item.quantity,
                        previousQuantity: previousDestinationQuantity,
                        currentQuantity: currentDestinationQuantity,
                        reason: `Stock transfer ${stockTransfer.transferNo}`,
                        variantId: item.variantId,
                        warehouseId: stockTransfer.toWarehouseId,
                        userId: stockTransfer.userId,
                    },
                });
            }

            /**
             * Mark transfer as completed
             */
            return tx.stockTransfer.update({
                where: {
                    id: stockTransferId,
                },

                data: {
                    status: StockTransferStatus.COMPLETED,
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

        return completedTransfer;
    }
}