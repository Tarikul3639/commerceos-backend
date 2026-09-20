import { Module } from "@nestjs/common"

import { AnalyticsController } from "./controllers/analytics.controller"

import { GetAnalyticsOverviewService } from "./services/get-analytics-overview.service"
import { GetRevenueChartService } from "./services/get-revenue-chart.service"
import { GetSalesChartService } from "./services/get-sales-chart.service"
import { GetPurchaseChartService } from "./services/get-purchase-chart.service"

@Module({
    controllers: [
        AnalyticsController,
    ],

    providers: [
        GetAnalyticsOverviewService,
        GetRevenueChartService,
        GetSalesChartService,
        GetPurchaseChartService,
    ],

    exports: [
        GetAnalyticsOverviewService,
    ],
})
export class AnalyticsModule {}