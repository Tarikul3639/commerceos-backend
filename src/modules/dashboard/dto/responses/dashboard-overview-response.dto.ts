import { ApiProperty } from '@nestjs/swagger';

import { SalesSummaryResponseDto } from './sales-summary-response.dto.js';
import { StockSummaryResponseDto } from './stock-summary-response.dto.js';
import { OrderSummaryResponseDto } from './order-summary-response.dto.js';
import { CustomerSummaryResponseDto } from './customer-summary-response.dto.js';
import { LowStockProductItemDto } from './low-stock-products-response.dto.js';
import { RecentActivityItemDto } from './recent-activities-response.dto.js';
import { RecentOrderItemDto } from './recent-orders-response.dto.js';

export class DashboardOverviewResponseDto {
  @ApiProperty({
    type: () => SalesSummaryResponseDto,
  })
  sales!: SalesSummaryResponseDto;

  @ApiProperty({
    type: () => StockSummaryResponseDto,
  })
  stock!: StockSummaryResponseDto;

  @ApiProperty({
    type: () => OrderSummaryResponseDto,
  })
  orders!: OrderSummaryResponseDto;

  @ApiProperty({
    type: () => CustomerSummaryResponseDto,
  })
  customers!: CustomerSummaryResponseDto;

  @ApiProperty({
    type: [LowStockProductItemDto],
  })
  lowStockProducts!: LowStockProductItemDto[];

  @ApiProperty({
    type: [RecentActivityItemDto],
  })
  recentActivities!: RecentActivityItemDto[];

  @ApiProperty({
    type: [RecentOrderItemDto],
  })
  recentOrders!: RecentOrderItemDto[];
}
