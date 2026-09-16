import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { PurchaseSummaryResponseDto } from '../dto/responses/purchase-summary-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetPurchaseSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<PurchaseSummaryResponseDto> {
        // Get the selected dashboard date range
        const { startDate, endDate } = getDashboardDateRange(query);

        // Build Prisma where condition for the selected period
        const where: Prisma.PurchaseWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        // Get total purchases and total purchase orders in parallel
        const [
            {
                _sum: { total: totalPurchasesRaw },
            },
            totalPurchaseOrders,
        ] = await Promise.all([
            // Calculate total purchase amount
            this.prisma.purchase.aggregate({
                where,
                _sum: {
                    total: true,
                },
            }),

            // Count total purchase orders
            this.prisma.purchase.count({
                where,
            }),
        ]);

        // Convert Prisma Decimal to JavaScript number
        const totalPurchases = Number(totalPurchasesRaw ?? 0);

        // Get today's starting time (00:00:00)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Calculate today's total purchases
        const {
            _sum: { total: todayPurchasesRaw },
        } = await this.prisma.purchase.aggregate({
            where: {
                createdAt: {
                    gte: startOfToday,
                },
            },
            _sum: {
                total: true,
            },
        });

        // Convert Prisma Decimal to JavaScript number
        const todayPurchases = Number(todayPurchasesRaw ?? 0);

        // Count pending purchases
        const pendingPurchases = await this.prisma.purchase.count({
            where: {
                ...where,
                status: 'PENDING',
            },
        });

        // Calculate the previous period
        // Example:
        // Current:  Sep 1 -> Sep 30
        // Previous: Aug 2 -> Aug 31
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(startDate);

        // Get previous period purchases
        const {
            _sum: { total: previousPurchasesRaw },
        } = await this.prisma.purchase.aggregate({
            where: {
                createdAt: getCreatedAtFilter(previousStartDate, previousEndDate),
            },
            _sum: {
                total: true,
            },
        });

        // Convert Prisma Decimal to JavaScript number
        const previousPurchases = Number(previousPurchasesRaw ?? 0);

        // Calculate purchase growth percentage
        const purchaseGrowth = Number(
            (previousPurchases > 0
                ? ((totalPurchases - previousPurchases) / previousPurchases) * 100
                : 0
            ).toFixed(2),
        );

        // Return purchase summary
        return {
            totalPurchases: totalPurchases.toString(),
            todayPurchases: todayPurchases.toString(),
            pendingPurchases,
            totalPurchaseOrders,
            purchaseGrowth,
        };
    }
}
