import { Injectable } from '@nestjs/common'
import { Prisma } from '@/lib/prisma/client'

import { PrismaService } from '../../../common/prisma/prisma.service'
import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto'
import { SalesPurchaseChartItemDto } from '../dto/responses/sales-purchase-chart-response.dto'
import { getAnalyticsDateRange } from '../utils/analytics-date-range.util'
import { getCreatedAtFilter } from '../utils/analytics-where.util'

@Injectable()
export class GetSalesPurchaseChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: AnalyticsQueryDto,
    ): Promise<SalesPurchaseChartItemDto[]> {
        /**
         * Get the selected analytics date range.
         */
        const { startDate, endDate } = getAnalyticsDateRange(query)

        /**
         * Build the createdAt filter using
         * the selected analytics date range.
         */
        const createdAt = getCreatedAtFilter(startDate, endDate)

        /**
         * Get sales and purchases created within
         * the selected analytics period.
         *
         * Both queries are independent, so they are
         * executed in parallel.
         */
        const [orders, purchases] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    createdAt,
                },
                select: {
                    total: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),

            this.prisma.purchase.findMany({
                where: {
                    createdAt,
                },
                select: {
                    total: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),
        ])

        /**
         * Group sales and order counts by date.
         *
         * Map structure:
         *
         * date -> sales + orders
         *
         * Example:
         *
         * 2026-09-15 -> {
         *     sales: 150000,
         *     orders: 42
         * }
         */
        const salesGrouped = new Map<
            string,
            {
                sales: number
                orders: number
            }
        >()

        /**
         * Process each order and add its total
         * and count to the corresponding date.
         */
        for (const order of orders) {
            /**
             * Convert the order creation date
             * into YYYY-MM-DD format.
             */
            const date = order.createdAt.toISOString().slice(0, 10)

            /**
             * Get existing sales data for the date,
             * or create a new entry if the date
             * does not exist yet.
             */
            const current = salesGrouped.get(date) ?? {
                sales: 0,
                orders: 0,
            }

            /**
             * Add the order total to the
             * total sales for the date.
             */
            current.sales += Number(order.total)

            /**
             * Increment the total order count
             * for the date.
             */
            current.orders++

            /**
             * Save the updated sales data.
             */
            salesGrouped.set(date, current)
        }

        /**
         * Group purchase amounts by date.
         *
         * Map structure:
         *
         * date -> total purchases
         *
         * Example:
         *
         * 2026-09-15 -> 85000
         */
        const purchasesGrouped = new Map<string, number>()

        /**
         * Process each purchase and add its total
         * to the corresponding date.
         */
        for (const purchase of purchases) {
            /**
             * Convert the purchase creation date
             * into YYYY-MM-DD format.
             */
            const date = purchase.createdAt.toISOString().slice(0, 10)

            /**
             * Get the existing purchase amount
             * for the date.
             *
             * If the date does not exist yet,
             * start with 0.
             */
            const currentPurchases = purchasesGrouped.get(date) ?? 0

            /**
             * Add the current purchase total
             * to the day's total purchases.
             */
            purchasesGrouped.set(
                date,
                currentPurchases + Number(purchase.total),
            )
        }

        /**
         * Get all dates from both sales and purchases.
         *
         * This ensures that a date is not lost when
         * it only contains sales or only purchases.
         */
        const dates = new Set([
            ...salesGrouped.keys(),
            ...purchasesGrouped.keys(),
        ])

        /**
         * Convert the grouped sales and purchase data
         * into the final chart response.
         *
         * Each date contains:
         *
         * - Total sales
         * - Total purchases
         * - Total orders
         */
        return Array.from(dates)
            .sort()
            .map((date) => {
                const sales = salesGrouped.get(date)
                const purchases = purchasesGrouped.get(date)

                return {
                    date,
                    sales: (sales?.sales ?? 0).toString(),
                    purchases: (purchases ?? 0).toString(),
                    orders: sales?.orders ?? 0,
                }
            })
    }
}