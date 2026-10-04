import { ApiProperty } from '@nestjs/swagger';

import { SalesSummaryResponseDto } from '@/modules/dashboard/dto/responses/sales-summary-response.dto';
import { StockSummaryResponseDto } from '@/modules/dashboard/dto/responses/stock-summary-response.dto';
import { OrderSummaryResponseDto } from '@/modules/dashboard/dto/responses/order-summary-response.dto';
import { CustomerSummaryResponseDto } from '@/modules/dashboard/dto/responses/customer-summary-response.dto';
import { LowStockProductItemDto } from '@/modules/dashboard/dto/responses/low-stock-products-response.dto';
import { RecentActivityItemDto } from '@/modules/dashboard/dto/responses/recent-activities-response.dto';
import { RecentOrderItemDto } from '@/modules/dashboard/dto/responses/recent-orders-response.dto';

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
