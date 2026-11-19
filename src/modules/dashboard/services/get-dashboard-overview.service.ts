import { Injectable } from '@nestjs/common';

import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto.js';
import { DashboardOverviewResponseDto } from '../dto/responses/dashboard-overview-response.dto.js';

import { GetSalesSummaryService } from './get-sales-summary.service.js';
import { GetStockSummaryService } from './get-stock-summary.service.js';
import { GetOrderSummaryService } from './get-order-summary.service.js';
import { GetCustomerSummaryService } from './get-customer-summary.service.js';
import { GetLowStockProductsService } from './get-low-stock-products.service.js';
import { GetRecentActivitiesService } from './get-recent-activities.service.js';
import { GetRecentOrdersService } from './get-recent-orders.service.js';

@Injectable()
export class GetDashboardOverviewService {
  constructor(
    private readonly salesSummaryService: GetSalesSummaryService,
    private readonly stockSummaryService: GetStockSummaryService,
    private readonly orderSummaryService: GetOrderSummaryService,
    private readonly customerSummaryService: GetCustomerSummaryService,
    private readonly lowStockProductsService: GetLowStockProductsService,
    private readonly recentActivitiesService: GetRecentActivitiesService,
    private readonly recentOrdersService: GetRecentOrdersService,
  ) {}

  async execute(
    query: DashboardQueryDto,
  ): Promise<DashboardOverviewResponseDto> {
    const [
      sales,
      stock,
      orders,
      customers,
      lowStockProducts,
      recentActivities,
      recentOrders,
    ] = await Promise.all([
      this.salesSummaryService.execute(query),
      this.stockSummaryService.execute(query),
      this.orderSummaryService.execute(query),
      this.customerSummaryService.execute(query),
      this.lowStockProductsService.execute(query),
      this.recentActivitiesService.execute(query),
      this.recentOrdersService.execute(),
    ]);

    return {
      sales,
      stock,
      orders,
      customers,
      lowStockProducts,
      recentActivities,
      recentOrders,
    };
  }
}
