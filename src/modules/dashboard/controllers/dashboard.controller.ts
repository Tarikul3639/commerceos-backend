import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { DashboardQueryDto } from '@/modules/dashboard/dto/requests/dashboard-query.dto';

import { DashboardOverviewResponseDto } from '@/modules/dashboard/dto/responses/dashboard-overview-response.dto';
import { SalesSummaryResponseDto } from '@/modules/dashboard/dto/responses/sales-summary-response.dto';
import { StockSummaryResponseDto } from '@/modules/dashboard/dto/responses/stock-summary-response.dto';
import { OrderSummaryResponseDto } from '@/modules/dashboard/dto/responses/order-summary-response.dto';
import { CustomerSummaryResponseDto } from '@/modules/dashboard/dto/responses/customer-summary-response.dto';
import { LowStockProductItemDto } from '@/modules/dashboard/dto/responses/low-stock-products-response.dto';
import { RecentActivityItemDto } from '@/modules/dashboard/dto/responses/recent-activities-response.dto';
import { RecentOrderItemDto } from '@/modules/dashboard/dto/responses/recent-orders-response.dto';
import { RecentOrdersQueryDto } from '@/modules/dashboard/dto/requests/recent-orders-query.dto';

import { GetDashboardOverviewService } from '@/modules/dashboard/services/get-dashboard-overview.service';
import { GetSalesSummaryService } from '@/modules/dashboard/services/get-sales-summary.service';
import { GetStockSummaryService } from '@/modules/dashboard/services/get-stock-summary.service';
import { GetOrderSummaryService } from '@/modules/dashboard/services/get-order-summary.service';
import { GetCustomerSummaryService } from '@/modules/dashboard/services/get-customer-summary.service';
import { GetLowStockProductsService } from '@/modules/dashboard/services/get-low-stock-products.service';
import { GetRecentActivitiesService } from '@/modules/dashboard/services/get-recent-activities.service';
import { GetRecentOrdersService } from '@/modules/dashboard/services/get-recent-orders.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardOverviewService: GetDashboardOverviewService,
    private readonly getSalesSummaryService: GetSalesSummaryService,
    private readonly getStockSummaryService: GetStockSummaryService,
    private readonly getOrderSummaryService: GetOrderSummaryService,
    private readonly getCustomerSummaryService: GetCustomerSummaryService,
    private readonly getLowStockProductsService: GetLowStockProductsService,
    private readonly getRecentActivitiesService: GetRecentActivitiesService,
    private readonly getRecentOrdersService: GetRecentOrdersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get dashboard overview',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview data',
    type: DashboardOverviewResponseDto,
  })
  getOverview(@Query() query: DashboardQueryDto) {
    return this.getDashboardOverviewService.execute(query);
  }

  @Get('sales-summary')
  @ApiOperation({
    summary: 'Get sales summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales summary data',
    type: SalesSummaryResponseDto,
  })
  getSalesSummary(@Query() query: DashboardQueryDto) {
    return this.getSalesSummaryService.execute(query);
  }

  @Get('stock-summary')
  @ApiOperation({
    summary: 'Get stock summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock summary data',
    type: StockSummaryResponseDto,
  })
  getStockSummary(@Query() query: DashboardQueryDto) {
    return this.getStockSummaryService.execute(query);
  }

  @Get('order-summary')
  @ApiOperation({
    summary: 'Get order summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Order summary data',
    type: OrderSummaryResponseDto,
  })
  getOrderSummary(@Query() query: DashboardQueryDto) {
    return this.getOrderSummaryService.execute(query);
  }

  @Get('customer-summary')
  @ApiOperation({
    summary: 'Get customer summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer summary data',
    type: CustomerSummaryResponseDto,
  })
  getCustomerSummary(@Query() query: DashboardQueryDto) {
    return this.getCustomerSummaryService.execute(query);
  }

  @Get('low-stock-products')
  @ApiOperation({
    summary: 'Get low stock products',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products',
    type: [LowStockProductItemDto],
    isArray: true,
  })
  getLowStockProducts(@Query() query: DashboardQueryDto) {
    return this.getLowStockProductsService.execute(query);
  }

  @Get('recent-activities')
  @ApiOperation({
    summary: 'Get recent activities',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent dashboard activities',
    type: [RecentActivityItemDto],
    isArray: true,
  })
  getRecentActivities(@Query() query: DashboardQueryDto) {
    return this.getRecentActivitiesService.execute(query);
  }

  @Get('recent-orders')
  @ApiOperation({
    summary: 'Get recent orders across all order statuses',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent dashboard orders',
    type: [RecentOrderItemDto],
    isArray: true,
  })
  getRecentOrders(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: RecentOrdersQueryDto,
  ) {
    return this.getRecentOrdersService.execute(query.limit);
  }
}
