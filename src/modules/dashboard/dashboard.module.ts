import { Module } from "@nestjs/common"

import { DashboardController } from "./controllers/dashboard.controller"

import { GetDashboardOverviewService } from "./services/get-dashboard-overview.service"
import { GetSalesSummaryService } from "./services/get-sales-summary.service"
import { GetPurchaseSummaryService } from "./services/get-purchase-summary.service"
import { GetStockSummaryService } from "./services/get-stock-summary.service"
import { GetOrderSummaryService } from "./services/get-order-summary.service"
import { GetCustomerSummaryService } from "./services/get-customer-summary.service"
import { GetEmployeeSummaryService } from "./services/get-employee-summary.service"
import { GetLowStockProductsService } from "./services/get-low-stock-products.service"
import { GetRecentActivitiesService } from "./services/get-recent-activities.service"
import { GetRecentOrdersService } from "./services/get-recent-orders.service"

@Module({
    controllers: [DashboardController],

    providers: [
        GetDashboardOverviewService,
        GetSalesSummaryService,
        GetPurchaseSummaryService,
        GetStockSummaryService,
        GetOrderSummaryService,
        GetCustomerSummaryService,
        GetEmployeeSummaryService,
        GetLowStockProductsService,
        GetRecentActivitiesService,
        GetRecentOrdersService,
    ],

    exports: [
        GetDashboardOverviewService,
    ],
})
export class DashboardModule {}
