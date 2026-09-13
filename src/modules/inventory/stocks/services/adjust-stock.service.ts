import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';
import { StockResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class AdjustStockService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        adjustStockDto: AdjustStockDto,
    ): Promise<StockResponseDto> {
        const { variantId, warehouseId, quantity, reason } = adjustStockDto;

        if (quantity === 0) {
            throw new BadRequestException('Adjustment quantity cannot be zero');
        }

        return this.prisma.$transaction(async (tx) => {
            /**
             * Check product variant.
             */
            const variant = await tx.productVariant.findFirst({
                where: {
                    id: variantId,
                    deletedAt: null,
                    isActive: true,
                },

                select: {
                    id: true,
                    sku: true,

                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            if (!variant) {
                throw new NotFoundException('Product variant not found');
            }

            /**
             * Check warehouse.
             */
            const warehouse = await tx.warehouse.findFirst({
                where: {
                    id: warehouseId,
                    deletedAt: null,
                    isActive: true,
                },

                select: {
                    id: true,
                    name: true,
                },
            });

            if (!warehouse) {
                throw new NotFoundException('Warehouse not found');
            }

            /**
             * Find existing inventory.
             */
            const inventory = await tx.inventory.findUnique({
                where: {
                    variantId_warehouseId: {
                        variantId,
                        warehouseId,
                    },
                },
            });

            // Get the previous quantity, defaulting to 0 if inventory does not exist
            const previousQuantity = inventory?.quantity ?? 0;
            // Calculate the current quantity after adjustment
            const currentQuantity = previousQuantity + quantity;

            /**
             * Prevent negative stock.
             */
            if (currentQuantity < 0) {
                throw new BadRequestException('Insufficient stock quantity');
            }

            /**
             * Create or update inventory.
             */
            const updatedInventory = await tx.inventory.upsert({
                where: {
                    variantId_warehouseId: {
                        variantId,
                        warehouseId,
                    },
                },

                create: {
                    variantId,
                    warehouseId,
                    quantity: currentQuantity,
                },

                update: {
                    quantity: currentQuantity,
                },
            });

            /**
             * Create stock movement history.
             */
            await tx.stockMovement.create({
                data: {
                    type: 'ADJUSTMENT',

                    quantity,
                    previousQuantity,
                    currentQuantity,

                    ...(reason !== undefined && {
                        reason,
                    }),

                    variantId,
                    warehouseId,
                    userId,
                },
            });

            return {
                id: updatedInventory.id,

                quantity: updatedInventory.quantity,

                reservedQuantity: updatedInventory.reservedQuantity,
                availableQuantity:
                    updatedInventory.quantity - updatedInventory.reservedQuantity,

                variantId,
                sku: variant.sku,

                productId: variant.product.id,
                productName: variant.product.name,
                warehouseId,
                warehouseName: warehouse.name,

                createdAt: updatedInventory.createdAt,
                updatedAt: updatedInventory.updatedAt,
            };
        });
    }
}
