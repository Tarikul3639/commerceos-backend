import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { StockSummaryResponseDto } from '../dto/responses/stock-summary-response.dto';

@Injectable()
export class GetStockSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(_query: DashboardQueryDto): Promise<StockSummaryResponseDto> {
        /**
         * Get product, variant, and inventory statistics
         * in parallel.
         */
        const [totalProducts, totalVariants, inventories] = await Promise.all([
            /**
             * Count all products.
             */
            this.prisma.product.count(),

            /**
             * Count all active and non-deleted variants.
             */
            this.prisma.productVariant.count({
                where: {
                    isActive: true,
                    deletedAt: null,
                },
            }),

            /**
             * Get all inventory records with the
             * selling price of each variant.
             *
             * Selling price is required to calculate
             * the total stock value.
             */
            this.prisma.inventory.findMany({
                include: {
                    variant: {
                        select: {
                            sellingPrice: true,
                        },
                    },
                },
            }),
        ]);

        /**
         * Initialize stock summary values.
         */
        let totalStockQuantity = 0;
        let totalStockValue = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;

        /**
         * Calculate stock quantity, stock value,
         * low-stock products, and out-of-stock products.
         */
        for (const inventory of inventories) {
            const quantity = inventory.quantity;

            /**
             * Add the current inventory quantity
             * to the total stock quantity.
             */
            totalStockQuantity += quantity;

            /**
             * Calculate the stock value using:
             *
             * Stock Value = Quantity × Selling Price
             */
            totalStockValue += quantity * Number(inventory.variant.sellingPrice);

            /**
             * Count products with zero stock
             * as out of stock.
             */
            if (quantity === 0) {
                outOfStockCount++;
            }

            /**
             * Count products with stock between
             * 1 and 5 as low stock.
             */
            else if (quantity <= 5) {
                lowStockCount++;
            }
        }

        /**
         * Return the stock dashboard summary.
         */
        return {
            totalProducts,
            totalVariants,
            totalStockQuantity,
            totalStockValue: totalStockValue.toString(),
            lowStockCount,
            outOfStockCount,
        };
    }
}
