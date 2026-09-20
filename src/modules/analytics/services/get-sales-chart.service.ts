import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto'
import { SalesChartResponseDto } from '../dto/responses/sales-chart-response.dto';
import { getCreatedAtFilter } from "../utils/analytics-where.util";
import { getAnalyticsDateRange } from '../utils/analytics-date-range.util';

@Injectable()
export class GetSalesChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: AnalyticsQueryDto): Promise<SalesChartResponseDto> {
        /**
         * Get the selected analytics date range.
         */
        const { startDate, endDate } = getAnalyticsDateRange(query);

        /**
         * Get orders created within the selected period.
         *
         * Only total and createdAt are selected because
         * they are required to generate the sales chart.
         */
        const orders = await this.prisma.order.findMany({
            where: {
                createdAt: getCreatedAtFilter(startDate, endDate),
            },
            select: {
                total: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        /**
         * Group sales and order counts by date.
         *
         * Each date contains:
         * - Total sales
         * - Total number of orders
         */
        const grouped = new Map<
            string,
            {
                sales: number;
                orders: number;
            }
        >();

        /**
         * Process each order and add its total
         * and count to the corresponding date.
         */
        for (const order of orders) {
            /**
             * Convert the order creation date
             * into YYYY-MM-DD format.
             */
            const date = order.createdAt.toISOString().slice(0, 10);

            /**
             * Get existing data for the date,
             * or create a new entry if the date
             * does not exist yet.
             */
            const current = grouped.get(date) ?? {
                sales: 0,
                orders: 0,
            };

            /**
             * Add the order total to the
             * total sales for the date.
             */
            current.sales += Number(order.total);

            /**
             * Increment the total order count
             * for the date.
             */
            current.orders++;

            /**
             * Save the updated data for the date.
             */
            grouped.set(date, current);
        }

        /**
         * Convert the grouped Map into the
         * response format expected by the dashboard.
         */
        return {
            data: Array.from(grouped.entries()).map(([date, value]) => ({
                date,
                sales: value.sales.toString(),
                orders: value.orders,
            })),
        };
    }
}
