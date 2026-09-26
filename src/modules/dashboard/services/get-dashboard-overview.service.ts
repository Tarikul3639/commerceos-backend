import { Injectable } from "@nestjs/common"

import { DashboardQueryDto } from "../dto/requests/dashboard-query.dto"
import { DashboardOverviewResponseDto } from "../dto/responses/dashboard-overview-response.dto"

import { GetSalesSummaryService } from "./get-sales-summary.service"
import { GetStockSummaryService } from "./get-stock-summary.service"
import { GetOrderSummaryService } from "./get-order-summary.service"
import { GetCustomerSummaryService } from "./get-customer-summary.service"
import { GetLowStockProductsService } from "./get-low-stock-products.service"
import { GetRecentActivitiesService } from "./get-recent-activities.service"
import { GetRecentOrdersService } from "./get-recent-orders.service"

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
    ) { }

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
        ])

        return {
            sales,
            stock,
            orders,
            customers,
            lowStockProducts,
            recentActivities,
            recentOrders,
        }
    }
}
