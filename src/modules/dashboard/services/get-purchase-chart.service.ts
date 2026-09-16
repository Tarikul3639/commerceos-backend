import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { PurchaseChartResponseDto } from '../dto/responses/purchase-chart-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetPurchaseChartService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<PurchaseChartResponseDto> {
        /**
         * Get the selected dashboard date range.
         */
        const { startDate, endDate } = getDashboardDateRange(query);

        /**
         * Build the purchase filter using
         * the selected date range.
         */
        const where: Prisma.PurchaseWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        /**
         * Get purchases created within the selected period.
         *
         * Only total and createdAt are selected because
         * they are required to generate the purchase chart.
         */
        const purchases = await this.prisma.purchase.findMany({
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
         * Group total purchase amount by date.
         *
         * Map structure:
         *
         * date -> total purchases
         *
         * Example:
         *
         * 2026-09-15 -> 100000
         * 2026-09-16 -> 150000
         */
        const grouped = new Map<string, number>();

        /**
         * Process each purchase and add its total
         * to the corresponding date.
         */
        for (const purchase of purchases) {
            /**
             * Convert the purchase creation date
             * into YYYY-MM-DD format.
             */
            const date = purchase.createdAt.toISOString().slice(0, 10);

            /**
             * Get the existing purchase amount
             * for the date.
             *
             * If the date does not exist yet,
             * start with 0.
             */
            const currentPurchases = grouped.get(date) ?? 0;

            /**
             * Add the current purchase total
             * to the day's total purchases.
             */
            grouped.set(date, currentPurchases + Number(purchase.total));
        }

        /**
         * Convert the grouped Map into the
         * response format expected by the dashboard.
         */
        return {
            data: Array.from(grouped.entries()).map(([date, purchases]) => ({
                date,
                purchases: purchases.toString(),
            })),
        };
    }
}
