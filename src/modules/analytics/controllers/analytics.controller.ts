import { Controller, Get, Query } from "@nestjs/common"
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger"

import { AnalyticsQueryDto } from "../dto/requests/analytics-query.dto"

import { RevenueChartItemDto } from "../dto/responses/revenue-chart-response.dto"
import { SalesPurchaseChartItemDto } from "../dto/responses/sales-purchase-chart-response.dto"
import { TopProductItemDto } from "../dto/responses/top-products-response.dto"
import { TopCustomerItemDto } from "../dto/responses/top-customers-response.dto"
import { PurchaseSummaryResponseDto } from "../dto/responses/purchase-summary-response.dto"

import { GetRevenueChartService } from "../services/get-revenue-chart.service"
import { GetSalesPurchaseChartService } from "../services/get-sales-purchase-chart.service"
import { GetTopProductsService } from "../services/get-top-products.service"
import { GetTopCustomersService } from "../services/get-top-customers.service"
import { GetPurchaseSummaryService } from "../services/get-purchase-summary.service"

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
    constructor(
        private readonly getRevenueChartService: GetRevenueChartService,
        private readonly getSalesPurchaseChartService: GetSalesPurchaseChartService,
        private readonly getTopProductsService: GetTopProductsService,
        private readonly getTopCustomersService: GetTopCustomersService,
        private readonly getPurchaseSummaryService: GetPurchaseSummaryService,
    ) { }

    @Get("revenue-chart")
    @ApiOperation({
        summary: "Get revenue chart data",
    })
    @ApiResponse({
        status: 200,
        description: "Revenue chart data",
        type: [RevenueChartItemDto],
    })
    getRevenueChart(@Query() query: AnalyticsQueryDto) {
        return this.getRevenueChartService.execute(query)
    }

    @Get("sales-purchase-chart")
    @ApiOperation({
        summary: "Get sales and purchase chart data",
    })
    @ApiResponse({
        status: 200,
        description: "Sales and purchase chart data",
        type: [SalesPurchaseChartItemDto],
    })
    getSalesPurchaseChart(@Query() query: AnalyticsQueryDto) {
        return this.getSalesPurchaseChartService.execute(query)
    }

    @Get("top-products")
    @ApiOperation({
        summary: "Get top selling products",
    })
    @ApiResponse({
        status: 200,
        description: "Top selling products",
        type: [TopProductItemDto],
    })
    getTopProducts(@Query() query: AnalyticsQueryDto) {
        return this.getTopProductsService.execute(query)
    }

    @Get("top-customers")
    @ApiOperation({
        summary: "Get top customers",
    })
    @ApiResponse({
        status: 200,
        description: "Top customers",
        type: [TopCustomerItemDto],
    })
    getTopCustomers(@Query() query: AnalyticsQueryDto) {
        return this.getTopCustomersService.execute(query)
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
    getPurchaseSummary(@Query() query: AnalyticsQueryDto) {
        return this.getPurchaseSummaryService.execute(query)
    }
}