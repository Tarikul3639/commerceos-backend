import { Controller, Get, Query } from "@nestjs/common"
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger"

import { DashboardQueryDto } from "../dto/requests/dashboard-query.dto"

import { DashboardOverviewResponseDto } from "../dto/responses/dashboard-overview-response.dto"
import { SalesSummaryResponseDto } from "../dto/responses/sales-summary-response.dto"
import { PurchaseSummaryResponseDto } from "../dto/responses/purchase-summary-response.dto"
import { StockSummaryResponseDto } from "../dto/responses/stock-summary-response.dto"
import { OrderSummaryResponseDto } from "../dto/responses/order-summary-response.dto"
import { CustomerSummaryResponseDto } from "../dto/responses/customer-summary-response.dto"
import { EmployeeSummaryResponseDto } from "../dto/responses/employee-summary-response.dto"
import { TopProductsResponseDto } from "../dto/responses/top-products-response.dto"
import { TopCustomersResponseDto } from "../dto/responses/top-customers-response.dto"
import { LowStockProductsResponseDto } from "../dto/responses/low-stock-products-response.dto"
import { RecentActivitiesResponseDto } from "../dto/responses/recent-activities-response.dto"

import { GetDashboardOverviewService } from "../services/get-dashboard-overview.service"
import { GetSalesSummaryService } from "../services/get-sales-summary.service"
import { GetPurchaseSummaryService } from "../services/get-purchase-summary.service"
import { GetStockSummaryService } from "../services/get-stock-summary.service"
import { GetOrderSummaryService } from "../services/get-order-summary.service"
import { GetCustomerSummaryService } from "../services/get-customer-summary.service"
import { GetEmployeeSummaryService } from "../services/get-employee-summary.service"
import { GetTopProductsService } from "../services/get-top-products.service"
import { GetTopCustomersService } from "../services/get-top-customers.service"
import { GetLowStockProductsService } from "../services/get-low-stock-products.service"
import { GetRecentActivitiesService } from "../services/get-recent-activities.service"

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
    constructor(
        private readonly getDashboardOverviewService: GetDashboardOverviewService,
        private readonly getSalesSummaryService: GetSalesSummaryService,
        private readonly getPurchaseSummaryService: GetPurchaseSummaryService,
        private readonly getStockSummaryService: GetStockSummaryService,
        private readonly getOrderSummaryService: GetOrderSummaryService,
        private readonly getCustomerSummaryService: GetCustomerSummaryService,
        private readonly getEmployeeSummaryService: GetEmployeeSummaryService,
        private readonly getTopProductsService: GetTopProductsService,
        private readonly getTopCustomersService: GetTopCustomersService,
        private readonly getLowStockProductsService: GetLowStockProductsService,
        private readonly getRecentActivitiesService: GetRecentActivitiesService,
    ) { }

    @Get()
    @ApiOperation({
        summary: "Get dashboard overview",
    })
    @ApiResponse({
        status: 200,
        description: "Dashboard overview data",
        type: DashboardOverviewResponseDto,
    })
    getOverview(@Query() query: DashboardQueryDto) {
        return this.getDashboardOverviewService.execute(query)
    }

    @Get("sales-summary")
    @ApiOperation({
        summary: "Get sales summary",
    })
    @ApiResponse({
        status: 200,
        description: "Sales summary data",
        type: SalesSummaryResponseDto,
    })
    getSalesSummary(@Query() query: DashboardQueryDto) {
        return this.getSalesSummaryService.execute(query)
    }

    @Get("purchase-summary")
    @ApiOperation({
        summary: "Get purchase summary",
    })
    @ApiResponse({
        status: 200,
        description: "Purchase summary data",
        type: PurchaseSummaryResponseDto,
    })
    getPurchaseSummary(@Query() query: DashboardQueryDto) {
        return this.getPurchaseSummaryService.execute(query)
    }

    @Get("stock-summary")
    @ApiOperation({
        summary: "Get stock summary",
    })
    @ApiResponse({
        status: 200,
        description: "Stock summary data",
        type: StockSummaryResponseDto,
    })
    getStockSummary(@Query() query: DashboardQueryDto) {
        return this.getStockSummaryService.execute(query)
    }

    @Get("order-summary")
    @ApiOperation({
        summary: "Get order summary",
    })
    @ApiResponse({
        status: 200,
        description: "Order summary data",
        type: OrderSummaryResponseDto,
    })
    getOrderSummary(@Query() query: DashboardQueryDto) {
        return this.getOrderSummaryService.execute(query)
    }

    @Get("customer-summary")
    @ApiOperation({
        summary: "Get customer summary",
    })
    @ApiResponse({
        status: 200,
        description: "Customer summary data",
        type: CustomerSummaryResponseDto,
    })
    getCustomerSummary(@Query() query: DashboardQueryDto) {
        return this.getCustomerSummaryService.execute(query)
    }

    @Get("employee-summary")
    @ApiOperation({
        summary: "Get employee summary",
    })
    @ApiResponse({
        status: 200,
        description: "Employee summary data",
        type: EmployeeSummaryResponseDto,
    })
    getEmployeeSummary(@Query() query: DashboardQueryDto) {
        return this.getEmployeeSummaryService.execute(query)
    }

    @Get("top-products")
    @ApiOperation({
        summary: "Get top selling products",
    })
    @ApiResponse({
        status: 200,
        description: "Top selling products",
        type: TopProductsResponseDto,
    })
    getTopProducts(@Query() query: DashboardQueryDto) {
        return this.getTopProductsService.execute(query)
    }

    @Get("top-customers")
    @ApiOperation({
        summary: "Get top customers",
    })
    @ApiResponse({
        status: 200,
        description: "Top customers",
        type: TopCustomersResponseDto,
    })
    getTopCustomers(@Query() query: DashboardQueryDto) {
        return this.getTopCustomersService.execute(query)
    }

    @Get("low-stock-products")
    @ApiOperation({
        summary: "Get low stock products",
    })
    @ApiResponse({
        status: 200,
        description: "Low stock products",
        type: LowStockProductsResponseDto,
    })
    getLowStockProducts(@Query() query: DashboardQueryDto) {
        return this.getLowStockProductsService.execute(query)
    }

    @Get("recent-activities")
    @ApiOperation({
        summary: "Get recent activities",
    })
    @ApiResponse({
        status: 200,
        description: "Recent dashboard activities",
        type: RecentActivitiesResponseDto,
    })
    getRecentActivities(@Query() query: DashboardQueryDto) {
        return this.getRecentActivitiesService.execute(query)
    }
}