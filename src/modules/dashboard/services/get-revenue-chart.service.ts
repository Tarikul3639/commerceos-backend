import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { RevenueChartResponseDto } from '../dto/responses/revenue-chart-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetRevenueChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<RevenueChartResponseDto> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getDashboardDateRange(query);

        /**
         * Build the order filter using
         * the selected date range.
         */
        const where: Prisma.OrderWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /**
         * Get orders within the selected period.
         *
         * Only total and createdAt are selected because
         * they are required to calculate the revenue chart.
         */
        const orders = await this.prisma.order.findMany({
            where,
            select: {
                total: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        /**
         * Group total revenue by date.
         * Map structure:
         *
         * date -> revenue
         *
         * Example:
         * 2026-09-15 -> 150000
         * 2026-09-16 -> 200000
         */
        const grouped = new Map<string, number>();

        /**
         * Process each order and add its total
         * to the corresponding date.
         */
        for (const order of orders) {
            /**
             * Convert the order creation date
             * into YYYY-MM-DD format.
             */
            const date = order.createdAt.toISOString().slice(0, 10);

            /**
             * Get the existing revenue for the date.
             *
             * If the date does not exist yet,
             * start with 0.
             */
            const currentRevenue = grouped.get(date) ?? 0;

            /**
             * Add the current order total
             * to the day's revenue.
             */
            grouped.set(date, currentRevenue + Number(order.total));
        }

        /**
         * Convert the grouped Map into the
         * response format expected by the dashboard.
         */
        return {
            data: Array.from(grouped.entries()).map(([date, revenue]) => ({
                date,
                revenue: revenue.toString(),
            })),
        };
    }
}
