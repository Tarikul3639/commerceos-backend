import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { StockResponseDto } from '../dto/responses/stock-response.dto';

@Injectable()
export class GetStockService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(inventoryId: string): Promise<StockResponseDto> {
        const inventory = await this.prisma.inventory.findUnique({
            where: {
                id: inventoryId,
            },

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
        });

        if (!inventory) {
            throw new NotFoundException('Stock not found');
        }

        return {
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
        };
    }
}
