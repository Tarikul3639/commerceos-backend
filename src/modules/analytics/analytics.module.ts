import { Module } from '@nestjs/common';

import { AnalyticsController } from '@/modules/analytics/controllers/analytics.controller';

import { GetRevenueChartService } from '@/modules/analytics/services/get-revenue-chart.service';
import { GetSalesPurchaseChartService } from '@/modules/analytics/services/get-sales-purchase-chart.service';
import { GetTopProductsService } from '@/modules/analytics/services/get-top-products.service';
import { GetTopCustomersService } from '@/modules/analytics/services/get-top-customers.service';
import { GetPurchaseSummaryService } from '@/modules/analytics/services/get-purchase-summary.service';

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
