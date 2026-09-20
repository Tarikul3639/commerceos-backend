import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto';
import { TopProductItemDto } from '../dto/responses/top-products-response.dto';
import { getAnalyticsDateRange } from '../utils/analytics-date-range.util';
import { getCreatedAtFilter } from '../utils/analytics-where.util';

@Injectable()
export class GetTopProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: AnalyticsQueryDto): Promise<TopProductItemDto[]> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getAnalyticsDateRange(query);

        /**
         * Build the order filter using
         * the selected date range.
         */
        const orderWhere: Prisma.OrderWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /**
         * Get order items from orders created
         * within the selected period.
         *
         * Only the fields required for calculating
         * top products are selected.
         */
        const items = await this.prisma.orderItem.findMany({
            where: {
                order: orderWhere,
            },
            select: {
                quantity: true,
                subtotal: true,
                variantId: true,
                variant: {
                    select: {
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
         * Group order items by variant.
         *
         * Map structure:
         *
         * variantId -> product information + sales data
         *
         * Each variant keeps:
         * - Product ID
         * - Product name
         * - Variant ID
         * - SKU
         * - Total quantity sold
         * - Total revenue
         */
        const grouped = new Map<
            string,
            {
                productId: string;
                productName: string;
                productImage: string | null;
                variantId: string;
                sku: string;
                totalSold: number;
                totalRevenue: number;
            }
        >();

        /**
         * Process each order item and aggregate
         * its quantity and revenue by variant.
         */
        for (const item of items) {
            /**
             * Use variantId as the grouping key.
             *
             * This means each variant is treated
             * as a separate top-selling item.
             */
            const key = item.variantId;

            /**
             * Get existing aggregated data for the variant,
             * or create a new entry if it does not exist.
             */
            const current = grouped.get(key) ?? {
                productId: item.variant.product.id,
                productName: item.variant.product.name,
                productImage: item.variant.image,
                variantId: item.variantId,
                sku: item.variant.sku,
                totalSold: 0,
                totalRevenue: 0,
            };

            /**
             * Add the sold quantity to the
             * variant's total sold quantity.
             */
            current.totalSold += item.quantity;

            /**
             * Add the item subtotal to the
             * variant's total revenue.
             */
            current.totalRevenue += Number(item.subtotal);

            /**
             * Save the updated aggregated data
             * for the current variant.
             */
            grouped.set(key, current);
        }

        /**
         * Convert the Map into an array,
         * sort variants by total quantity sold
         * in descending order, and keep only
         * the top 10 variants.
         */
        const data = Array.from(grouped.values())
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10)
            .map((item) => ({
                ...item,

                /**
                 * Convert the numeric revenue value
                 * into a string for the response DTO.
                 */
                totalRevenue: item.totalRevenue.toString(),
            }));

        /**
         * Return the top products response.
         */
        return data;
    }
}
