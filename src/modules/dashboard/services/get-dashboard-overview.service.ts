import { Injectable } from "@nestjs/common"

import { DashboardQueryDto } from "../dto/requests/dashboard-query.dto"
import { DashboardOverviewResponseDto } from "../dto/responses/dashboard-overview-response.dto"

import { GetSalesSummaryService } from "./get-sales-summary.service"
import { GetPurchaseSummaryService } from "./get-purchase-summary.service"
import { GetStockSummaryService } from "./get-stock-summary.service"
import { GetOrderSummaryService } from "./get-order-summary.service"
import { GetCustomerSummaryService } from "./get-customer-summary.service"
import { GetEmployeeSummaryService } from "./get-employee-summary.service"
import { GetTopProductsService } from "./get-top-products.service"
import { GetTopCustomersService } from "./get-top-customers.service"
import { GetLowStockProductsService } from "./get-low-stock-products.service"
import { GetRecentActivitiesService } from "./get-recent-activities.service"

@Injectable()
export class GetDashboardOverviewService {
    constructor(
        private readonly salesSummaryService: GetSalesSummaryService,
        private readonly purchaseSummaryService: GetPurchaseSummaryService,
        private readonly stockSummaryService: GetStockSummaryService,
        private readonly orderSummaryService: GetOrderSummaryService,
        private readonly customerSummaryService: GetCustomerSummaryService,
        private readonly employeeSummaryService: GetEmployeeSummaryService,
        private readonly topProductsService: GetTopProductsService,
        private readonly topCustomersService: GetTopCustomersService,
        private readonly lowStockProductsService: GetLowStockProductsService,
        private readonly recentActivitiesService: GetRecentActivitiesService,
    ) { }

    async execute(
        query: DashboardQueryDto,
    ): Promise<DashboardOverviewResponseDto> {
        const [
            sales,
            purchases,
            stock,
            orders,
            customers,
            employees,
            topProducts,
            topCustomers,
            lowStockProducts,
            recentActivities,
        ] = await Promise.all([
            this.salesSummaryService.execute(query),
            this.purchaseSummaryService.execute(query),
            this.stockSummaryService.execute(query),
            this.orderSummaryService.execute(query),
            this.customerSummaryService.execute(query),
            this.employeeSummaryService.execute(query),
            this.topProductsService.execute(query),
            this.topCustomersService.execute(query),
            this.lowStockProductsService.execute(query),
            this.recentActivitiesService.execute(query),
        ])

        return {
            sales,
            purchases,
            stock,
            orders,
            customers,
            employees,
            topProducts,
            topCustomers,
            lowStockProducts,
            recentActivities,
        }
    }
}