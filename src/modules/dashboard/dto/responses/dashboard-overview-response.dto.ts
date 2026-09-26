import { ApiProperty } from "@nestjs/swagger"

import { SalesSummaryResponseDto } from "./sales-summary-response.dto"
import { StockSummaryResponseDto } from "./stock-summary-response.dto"
import { OrderSummaryResponseDto } from "./order-summary-response.dto"
import { CustomerSummaryResponseDto } from "./customer-summary-response.dto"
import { LowStockProductItemDto } from "./low-stock-products-response.dto"
import { RecentActivityItemDto } from "./recent-activities-response.dto"
import { RecentOrderItemDto } from "./recent-orders-response.dto"

export class DashboardOverviewResponseDto {
    @ApiProperty({
        type: () => SalesSummaryResponseDto,
    })
    sales!: SalesSummaryResponseDto

    @ApiProperty({
        type: () => StockSummaryResponseDto,
    })
    stock!: StockSummaryResponseDto

    @ApiProperty({
        type: () => OrderSummaryResponseDto,
    })
    orders!: OrderSummaryResponseDto

    @ApiProperty({
        type: () => CustomerSummaryResponseDto,
    })
    customers!: CustomerSummaryResponseDto

    @ApiProperty({
        type: [LowStockProductItemDto],
    })
    lowStockProducts!: LowStockProductItemDto[]

    @ApiProperty({
        type: [RecentActivityItemDto],
    })
    recentActivities!: RecentActivityItemDto[]

    @ApiProperty({
        type: [RecentOrderItemDto],
    })
    recentOrders!: RecentOrderItemDto[]
}
