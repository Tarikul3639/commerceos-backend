import { Module } from "@nestjs/common"

import { AnalyticsController } from "./controllers/analytics.controller"

import { GetRevenueChartService } from "./services/get-revenue-chart.service"
import { GetSalesPurchaseChartService } from "./services/get-sales-purchase-chart.service"
import { GetTopProductsService } from "./services/get-top-products.service"
import { GetTopCustomersService } from "./services/get-top-customers.service"
import { GetPurchaseSummaryService } from "./services/get-purchase-summary.service"

@Module({
    controllers: [
        AnalyticsController,
    ],

    providers: [
        GetRevenueChartService,
        GetSalesPurchaseChartService,
        GetTopProductsService,
        GetTopCustomersService,
        GetPurchaseSummaryService,
    ],

    exports: [
        GetPurchaseSummaryService,
    ],
})
export class AnalyticsModule { }