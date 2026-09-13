import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

@Injectable()
export class DeleteWarehouseService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(warehouseId: string): Promise<void> {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                deletedAt: null,
            },

            select: {
                id: true,

                _count: {
                    select: {
                        inventories: true,
                        purchases: true,
                        stockMovements: true,
                        fromStockTransfers: true,
                        toStockTransfers: true,
                        orders: true,
                    },
                },
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found');
        }

        const hasRelatedData =
            warehouse._count.inventories > 0 ||
            warehouse._count.purchases > 0 ||
            warehouse._count.stockMovements > 0 ||
            warehouse._count.fromStockTransfers > 0 ||
            warehouse._count.toStockTransfers > 0 ||
            warehouse._count.orders > 0;

        /**
         * Soft delete warehouse if it has related records.
         */
        if (hasRelatedData) {
            await this.prisma.warehouse.update({
                where: {
                    id: warehouseId,
                },

                data: {
                    deletedAt: new Date(),
                    isActive: false,
                },
            });

            return;
        }

        /**
         * Hard delete warehouse if it has no related records.
         */
        await this.prisma.warehouse.delete({
            where: {
                id: warehouseId,
            },
        });
    }
}