import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PurchaseStatus, StockMovementType } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { CreateStockMovementService } from '@/modules/inventory/stock-movements/services/create-stock-movement.service';

import { ReceivePurchaseDto } from '../dto/requests/receive-purchase.dto';

@Injectable()
export class ReceivePurchaseService {
    constructor(
        private readonly prisma: PrismaService,

        private readonly createStockMovementService: CreateStockMovementService,
    ) { }

    async execute(
        purchaseId: string,
        userId: string,
        receivePurchaseDto: ReceivePurchaseDto,
    ) {
        const purchase = await this.prisma.purchase.findUnique({
            where: {
                id: purchaseId,
            },

            include: {
                purchaseItems: true,
            },
        });

        if (!purchase) {
            throw new NotFoundException('Purchase not found');
        }

        if (purchase.status === PurchaseStatus.RECEIVED) {
            throw new BadRequestException('Purchase has already been received');
        }

        if (purchase.status === PurchaseStatus.CANCELLED) {
            throw new BadRequestException('Cancelled purchase cannot be received');
        }

        return this.prisma.$transaction(async (tx) => {
            for (const item of purchase.purchaseItems) {
                const inventory = await tx.inventory.findUnique({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: purchase.warehouseId,
                        },
                    },
                });

                const previousQuantity = inventory?.quantity ?? 0;

                const currentQuantity = previousQuantity + item.quantity;

                await tx.inventory.upsert({
                    where: {
                        variantId_warehouseId: {
                            variantId: item.variantId,

                            warehouseId: purchase.warehouseId,
                        },
                    },

                    create: {
                        variantId: item.variantId,

                        warehouseId: purchase.warehouseId,

                        quantity: item.quantity,

                        reservedQuantity: 0,
                    },

                    update: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },
                });

                await tx.stockMovement.create({
                    data: {
                        type: StockMovementType.PURCHASE,

                        quantity: item.quantity,

                        previousQuantity,

                        currentQuantity,

                        reason:
                            receivePurchaseDto.note ??
                            `Purchase received: ${purchase.invoiceNo}`,

                        variantId: item.variantId,

                        warehouseId: purchase.warehouseId,

                        userId,
                    },
                });
            }

            const updatedPurchase = await tx.purchase.update({
                where: {
                    id: purchaseId,
                },

                data: {
                    status: PurchaseStatus.RECEIVED,
                },

                include: {
                    supplier: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    warehouse: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    purchaseItems: true,
                },
            });

            return updatedPurchase;
        });
    }
}
