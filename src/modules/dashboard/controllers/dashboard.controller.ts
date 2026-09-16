import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { DashboardOverviewResponseDto } from '../dto/responses/dashboard-overview-response.dto';

import { GetDashboardOverviewService } from '../services/get-dashboard-overview.service';
import { GetSalesSummaryService } from '../services/get-sales-summary.service';
import { GetPurchaseSummaryService } from '../services/get-purchase-summary.service';
import { GetStockSummaryService } from '../services/get-stock-summary.service';
import { GetOrderSummaryService } from '../services/get-order-summary.service';
import { GetCustomerSummaryService } from '../services/get-customer-summary.service';
import { GetEmployeeSummaryService } from '../services/get-employee-summary.service';
import { GetSalesChartService } from '../services/get-sales-chart.service';
import { GetRevenueChartService } from '../services/get-revenue-chart.service';
import { GetPurchaseChartService } from '../services/get-purchase-chart.service';
import { GetTopProductsService } from '../services/get-top-products.service';
import { GetTopCustomersService } from '../services/get-top-customers.service';
import { GetLowStockProductsService } from '../services/get-low-stock-products.service';
import { GetRecentActivitiesService } from '../services/get-recent-activities.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly getDashboardOverviewService: GetDashboardOverviewService,
        private readonly getSalesSummaryService: GetSalesSummaryService,
        private readonly getPurchaseSummaryService: GetPurchaseSummaryService,
        private readonly getStockSummaryService: GetStockSummaryService,
        private readonly getOrderSummaryService: GetOrderSummaryService,
        private readonly getCustomerSummaryService: GetCustomerSummaryService,
        private readonly getEmployeeSummaryService: GetEmployeeSummaryService,
        private readonly getSalesChartService: GetSalesChartService,
        private readonly getRevenueChartService: GetRevenueChartService,
        private readonly getPurchaseChartService: GetPurchaseChartService,
        private readonly getTopProductsService: GetTopProductsService,
        private readonly getTopCustomersService: GetTopCustomersService,
        private readonly getLowStockProductsService: GetLowStockProductsService,
        private readonly getRecentActivitiesService: GetRecentActivitiesService,
    ) { }

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Dashboard overview data',
        type: DashboardOverviewResponseDto,
    })
    getOverview(@Query() query: DashboardQueryDto) {
        return this.getDashboardOverviewService.execute(query);
    }

    @Get('sales-summary')
    @ApiOperation({ summary: 'Get sales summary' })
    getSalesSummary(@Query() query: DashboardQueryDto) {
        return this.getSalesSummaryService.execute(query);
    }

    @Get('purchase-summary')
    @ApiOperation({ summary: 'Get purchase summary' })
    getPurchaseSummary(@Query() query: DashboardQueryDto) {
        return this.getPurchaseSummaryService.execute(query);
    }

    @Get('stock-summary')
    @ApiOperation({ summary: 'Get stock summary' })
    getStockSummary(@Query() query: DashboardQueryDto) {
        return this.getStockSummaryService.execute(query);
    }

    @Get('order-summary')
    @ApiOperation({ summary: 'Get order summary' })
    getOrderSummary(@Query() query: DashboardQueryDto) {
        return this.getOrderSummaryService.execute(query);
    }

    @Get('customer-summary')
    @ApiOperation({ summary: 'Get customer summary' })
    getCustomerSummary(@Query() query: DashboardQueryDto) {
        return this.getCustomerSummaryService.execute(query);
    }

    @Get('employee-summary')
    @ApiOperation({ summary: 'Get employee summary' })
    getEmployeeSummary(@Query() query: DashboardQueryDto) {
        return this.getEmployeeSummaryService.execute(query);
    }

    @Get('sales-chart')
    @ApiOperation({ summary: 'Get sales chart data' })
    getSalesChart(@Query() query: DashboardQueryDto) {
        return this.getSalesChartService.execute(query);
    }

    @Get('revenue-chart')
    @ApiOperation({ summary: 'Get revenue chart data' })
    getRevenueChart(@Query() query: DashboardQueryDto) {
        return this.getRevenueChartService.execute(query);
    }

    @Get('purchase-chart')
    @ApiOperation({ summary: 'Get purchase chart data' })
    getPurchaseChart(@Query() query: DashboardQueryDto) {
        return this.getPurchaseChartService.execute(query);
    }

    @Get('top-products')
    @ApiOperation({ summary: 'Get top selling products' })
    getTopProducts(@Query() query: DashboardQueryDto) {
        return this.getTopProductsService.execute(query);
    }

    @Get('top-customers')
    @ApiOperation({ summary: 'Get top customers' })
    getTopCustomers(@Query() query: DashboardQueryDto) {
        return this.getTopCustomersService.execute(query);
    }

    @Get('low-stock-products')
    @ApiOperation({ summary: 'Get low stock products' })
    getLowStockProducts(@Query() query: DashboardQueryDto) {
        return this.getLowStockProductsService.execute(query);
    }

    @Get('recent-activities')
    @ApiOperation({ summary: 'Get recent activities' })
    getRecentActivities(@Query() query: DashboardQueryDto) {
        return this.getRecentActivitiesService.execute(query);
    }
}
