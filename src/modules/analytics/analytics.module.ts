import { Module } from '@nestjs/common';

import { AnalyticsController } from './controllers/analytics.controller.js';

import { GetRevenueChartService } from './services/get-revenue-chart.service.js';
import { GetSalesPurchaseChartService } from './services/get-sales-purchase-chart.service.js';
import { GetTopProductsService } from './services/get-top-products.service.js';
import { GetTopCustomersService } from './services/get-top-customers.service.js';
import { GetPurchaseSummaryService } from './services/get-purchase-summary.service.js';

@Module({
  controllers: [AnalyticsController],

  providers: [
    GetRevenueChartService,
    GetSalesPurchaseChartService,
    GetTopProductsService,
    GetTopCustomersService,
    GetPurchaseSummaryService,
  ],

  exports: [GetPurchaseSummaryService],
})
export class AnalyticsModule {}
