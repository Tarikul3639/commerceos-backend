import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { SalesSummaryResponseDto } from '../dto/responses/sales-summary-response.dto';

import { getDashboardDateRange } from '../utils/dashboard-date-range.util';

@Injectable()
export class GetSalesSummaryService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(query: DashboardQueryDto): Promise<SalesSummaryResponseDto> {
        // Get dashboard date range based on custom dates or selected period
        const { startDate, endDate } = getDashboardDateRange(query);

        // Build Prisma where condition for the selected date range
        const where: Prisma.OrderWhereInput = {
            createdAt: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
            },
        };

        // Get total sales and total orders in parallel
        const [
            {
                _sum: { total: totalSalesRaw },
            },
            totalOrders,
        ] = await Promise.all([
            // Calculate total sales
            this.prisma.order.aggregate({
                where,
                _sum: {
                    total: true,
                },
            }),

            // Count total orders
            this.prisma.order.count({
                where,
            }),
        ]);

        // Prisma Decimal -> JavaScript number
        const totalSales = Number(totalSalesRaw ?? 0);

        // Get today's starting time: 00:00:00
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Calculate today's total sales
        const {
            _sum: { total: todaySalesRaw },
        } = await this.prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: startOfToday,
                },
            },
            _sum: {
                total: true,
            },
        });

        // Prisma Decimal -> JavaScript number
        const todaySales = Number(todaySalesRaw ?? 0);

        // Calculate average order value
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Calculate previous period
        const periodLength = endDate.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);
        const previousEndDate = new Date(startDate);
        // Previous period sales
        const {
            _sum: { total: previousSalesRaw },
        } = await this.prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: previousStartDate,
                    lt: previousEndDate,
                },
            },
            _sum: {
                total: true,
            },
        });
        const previousSales = Number(previousSalesRaw ?? 0);

        const salesGrowth = Number(
            (previousSales > 0
                ? ((totalSales - previousSales) / previousSales) * 100
                : 0
            ).toFixed(2),
        );

        // Return sales summary
        return {
            totalSales: totalSales.toString(),
            todaySales: todaySales.toString(),
            averageOrderValue: averageOrderValue.toString(),
            totalOrders,
            salesGrowth,
        };
    }
}
