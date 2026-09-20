import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { LowStockProductItemDto } from '../dto/responses/low-stock-products-response.dto';

@Injectable()
export class GetLowStockProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(_query: DashboardQueryDto): Promise<LowStockProductItemDto[]> {
        /**
         * Get inventory items whose current
         * quantity is at or below the low-stock threshold.
         */
        const inventories = await this.prisma.inventory.findMany({
            where: {
                quantity: {
                    lte: 5,
                },
            },
            orderBy: {
                quantity: 'asc',
            },
            take: 10,
            select: {
                quantity: true,
                variant: {
                    select: {
                        id: true,
                        sku: true,
                        image: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        /**
         * Transform inventory records into
         * the dashboard response format.
         */
        return inventories.map((inventory) => ({
            variantId: inventory.variant.id,
            sku: inventory.variant.sku,
            productId: inventory.variant.product.id,
            productName: inventory.variant.product.name,
            productImage: inventory.variant.image ?? null,
            quantity: inventory.quantity,
        }));
    }
}
