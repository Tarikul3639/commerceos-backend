import { Controller, Get, Query } from "@nestjs/common"
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger"

import { AnalyticsQueryDto } from "../dto/requests/analytics-query.dto"

import { AnalyticsOverviewResponseDto } from "../dto/responses/analytics-overview-response.dto"
import { RevenueChartResponseDto } from "../dto/responses/revenue-chart-response.dto"
import { SalesChartResponseDto } from "../dto/responses/sales-chart-response.dto"
import { PurchaseChartResponseDto } from "../dto/responses/purchase-chart-response.dto"

import { GetAnalyticsOverviewService } from "../services/get-analytics-overview.service"
import { GetRevenueChartService } from "../services/get-revenue-chart.service"
import { GetSalesChartService } from "../services/get-sales-chart.service"
import { GetPurchaseChartService } from "../services/get-purchase-chart.service"

@ApiTags("Analytics")
@ApiBearerAuth()
@Controller("analytics")
export class AnalyticsController {
    constructor(
        private readonly getAnalyticsOverviewService: GetAnalyticsOverviewService,
        private readonly getRevenueChartService: GetRevenueChartService,
        private readonly getSalesChartService: GetSalesChartService,
        private readonly getPurchaseChartService: GetPurchaseChartService,
    ) { }

    @Get()
    @ApiOperation({
        summary: "Get analytics overview",
    })
    @ApiResponse({
        status: 200,
        description: "Analytics overview data",
        type: AnalyticsOverviewResponseDto,
    })
    getOverview(@Query() query: AnalyticsQueryDto) {
        return this.getAnalyticsOverviewService.execute(query)
    }

    @Get("revenue-chart")
    @ApiOperation({
        summary: "Get revenue chart data",
    })
    @ApiResponse({
        status: 200,
        description: "Revenue chart data",
        type: RevenueChartResponseDto,
    })
    getRevenueChart(@Query() query: AnalyticsQueryDto) {
        return this.getRevenueChartService.execute(query)
    }

    @Get("sales-chart")
    @ApiOperation({
        summary: "Get sales chart data",
    })
    @ApiResponse({
        status: 200,
        description: "Sales chart data",
        type: SalesChartResponseDto,
    })
    getSalesChart(@Query() query: AnalyticsQueryDto) {
        return this.getSalesChartService.execute(query)
    }

    @Get("purchase-chart")
    @ApiOperation({
        summary: "Get purchase chart data",
    })
    @ApiResponse({
        status: 200,
        description: "Purchase chart data",
        type: PurchaseChartResponseDto,
    })
    getPurchaseChart(@Query() query: AnalyticsQueryDto) {
        return this.getPurchaseChartService.execute(query)
    }
}