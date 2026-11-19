import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { OrderStatus } from '../../../infrastructure/database/generated/prisma/client.js';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto.js';
import { OrderSummaryResponseDto } from '../dto/responses/order-summary-response.dto.js';
import { getDashboardDateRange } from '../utils/dashboard-date-range.util.js';
import { getCreatedAtFilter } from '../utils/dashboard-where.util.js';

@Injectable()
export class GetOrderSummaryService {
  constructor(private readonly prisma: PrismaService) {}

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
