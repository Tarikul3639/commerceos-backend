import { Module } from '@nestjs/common';

import { DashboardController } from '@/modules/dashboard/controllers/dashboard.controller';

import { GetDashboardOverviewService } from '@/modules/dashboard/services/get-dashboard-overview.service';
import { GetSalesSummaryService } from '@/modules/dashboard/services/get-sales-summary.service';
import { GetStockSummaryService } from '@/modules/dashboard/services/get-stock-summary.service';
import { GetOrderSummaryService } from '@/modules/dashboard/services/get-order-summary.service';
import { GetCustomerSummaryService } from '@/modules/dashboard/services/get-customer-summary.service';
import { GetLowStockProductsService } from '@/modules/dashboard/services/get-low-stock-products.service';
import { GetRecentActivitiesService } from '@/modules/dashboard/services/get-recent-activities.service';
import { GetRecentOrdersService } from '@/modules/dashboard/services/get-recent-orders.service';

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
