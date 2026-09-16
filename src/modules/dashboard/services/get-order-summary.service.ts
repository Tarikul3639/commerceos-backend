import { Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { OrderStatus } from '@/lib/prisma/client';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { OrderSummaryResponseDto } from '../dto/responses/order-summary-response.dto';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util';
import { getCreatedAtFilter } from '../utils/dashboard-where.util';

@Injectable()
export class GetOrderSummaryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(query: DashboardQueryDto): Promise<OrderSummaryResponseDto> {
        // Get dashboard date range
        const { startDate, endDate } = getDashboardDateRange(query);

        // Build common order where condition
        const where: Prisma.OrderWhereInput = {
            createdAt: getCreatedAtFilter(startDate, endDate),
        };

        // Get order counts by status in parallel
        const [
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
        ] = await Promise.all([
            // Total orders
            this.prisma.order.count({
                where,
            }),

            // Pending orders
            this.prisma.order.count({
                where: {
                    ...where,
                    status: OrderStatus.PENDING,
                },
            }),

            // Processing orders
            this.prisma.order.count({
                where: {
                    ...where,
                    status: OrderStatus.PROCESSING,
                },
            }),

            // Shipped orders
            this.prisma.order.count({
                where: {
                    ...where,
                    status: OrderStatus.SHIPPED,
                },
            }),

            // Delivered orders
            this.prisma.order.count({
                where: {
                    ...where,
                    status: OrderStatus.DELIVERED,
                },
            }),

            // Cancelled orders
            this.prisma.order.count({
                where: {
                    ...where,
                    status: OrderStatus.CANCELLED,
                },
            }),
        ]);

        // Return order summary
        return {
            totalOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
        };
    }
}
