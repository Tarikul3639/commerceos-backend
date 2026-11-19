import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Permission } from '../../../lib/prisma/enums.js';

import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto.js';

import { DashboardOverviewResponseDto } from '../dto/responses/dashboard-overview-response.dto.js';
import { SalesSummaryResponseDto } from '../dto/responses/sales-summary-response.dto.js';
import { StockSummaryResponseDto } from '../dto/responses/stock-summary-response.dto.js';
import { OrderSummaryResponseDto } from '../dto/responses/order-summary-response.dto.js';
import { CustomerSummaryResponseDto } from '../dto/responses/customer-summary-response.dto.js';
import { LowStockProductItemDto } from '../dto/responses/low-stock-products-response.dto.js';
import { RecentActivityItemDto } from '../dto/responses/recent-activities-response.dto.js';
import { RecentOrderItemDto } from '../dto/responses/recent-orders-response.dto.js';
import { RecentOrdersQueryDto } from '../dto/requests/recent-orders-query.dto.js';

import { GetDashboardOverviewService } from '../services/get-dashboard-overview.service.js';
import { GetSalesSummaryService } from '../services/get-sales-summary.service.js';
import { GetStockSummaryService } from '../services/get-stock-summary.service.js';
import { GetOrderSummaryService } from '../services/get-order-summary.service.js';
import { GetCustomerSummaryService } from '../services/get-customer-summary.service.js';
import { GetLowStockProductsService } from '../services/get-low-stock-products.service.js';
import { GetRecentActivitiesService } from '../services/get-recent-activities.service.js';
import { GetRecentOrdersService } from '../services/get-recent-orders.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Permissions(Permission.DASHBOARD_READ)
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
