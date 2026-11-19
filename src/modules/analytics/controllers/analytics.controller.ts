import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';

import { AnalyticsQueryDto } from '../dto/requests/analytics-query.dto.js';

import { RevenueChartItemDto } from '../dto/responses/revenue-chart-response.dto.js';
import { SalesPurchaseChartItemDto } from '../dto/responses/sales-purchase-chart-response.dto.js';
import { TopProductItemDto } from '../dto/responses/top-products-response.dto.js';
import { TopCustomerItemDto } from '../dto/responses/top-customers-response.dto.js';
import { PurchaseSummaryResponseDto } from '../dto/responses/purchase-summary-response.dto.js';

import { GetRevenueChartService } from '../services/get-revenue-chart.service.js';
import { GetSalesPurchaseChartService } from '../services/get-sales-purchase-chart.service.js';
import { GetTopProductsService } from '../services/get-top-products.service.js';
import { GetTopCustomersService } from '../services/get-top-customers.service.js';
import { GetPurchaseSummaryService } from '../services/get-purchase-summary.service.js';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Permissions(Permission.ANALYTICS_READ)
export class AnalyticsController {
  constructor(
    private readonly getRevenueChartService: GetRevenueChartService,
    private readonly getSalesPurchaseChartService: GetSalesPurchaseChartService,
    private readonly getTopProductsService: GetTopProductsService,
    private readonly getTopCustomersService: GetTopCustomersService,
    private readonly getPurchaseSummaryService: GetPurchaseSummaryService,
  ) {}

  @Get('revenue-chart')
  @ApiOperation({
    summary: 'Get revenue chart data',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue chart data',
    type: [RevenueChartItemDto],
  })
  getRevenueChart(@Query() query: AnalyticsQueryDto) {
    return this.getRevenueChartService.execute(query);
  }

  @Get('sales-purchase-chart')
  @ApiOperation({
    summary: 'Get sales and purchase chart data',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales and purchase chart data',
    type: [SalesPurchaseChartItemDto],
  })
  getSalesPurchaseChart(@Query() query: AnalyticsQueryDto) {
    return this.getSalesPurchaseChartService.execute(query);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Get top selling products',
  })
  @ApiResponse({
    status: 200,
    description: 'Top selling products',
    type: [TopProductItemDto],
  })
  getTopProducts(@Query() query: AnalyticsQueryDto) {
    return this.getTopProductsService.execute(query);
  }

  @Get('top-customers')
  @ApiOperation({
    summary: 'Get top customers',
  })
  @ApiResponse({
    status: 200,
    description: 'Top customers',
    type: [TopCustomerItemDto],
  })
  getTopCustomers(@Query() query: AnalyticsQueryDto) {
    return this.getTopCustomersService.execute(query);
  }

  @Get('purchase-summary')
  @ApiOperation({
    summary: 'Get purchase summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase summary data',
    type: PurchaseSummaryResponseDto,
  })
  getPurchaseSummary(@Query() query: AnalyticsQueryDto) {
    return this.getPurchaseSummaryService.execute(query);
  }
}
