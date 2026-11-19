import { Module } from '@nestjs/common';

import { DashboardController } from './controllers/dashboard.controller.js';

import { GetDashboardOverviewService } from './services/get-dashboard-overview.service.js';
import { GetSalesSummaryService } from './services/get-sales-summary.service.js';
import { GetStockSummaryService } from './services/get-stock-summary.service.js';
import { GetOrderSummaryService } from './services/get-order-summary.service.js';
import { GetCustomerSummaryService } from './services/get-customer-summary.service.js';
import { GetLowStockProductsService } from './services/get-low-stock-products.service.js';
import { GetRecentActivitiesService } from './services/get-recent-activities.service.js';
import { GetRecentOrdersService } from './services/get-recent-orders.service.js';

@Module({
  controllers: [DashboardController],

  providers: [
    GetDashboardOverviewService,
    GetSalesSummaryService,
    GetStockSummaryService,
    GetOrderSummaryService,
    GetCustomerSummaryService,
    GetLowStockProductsService,
    GetRecentActivitiesService,
    GetRecentOrdersService,
  ],

  exports: [GetDashboardOverviewService],
})
export class DashboardModule {}
