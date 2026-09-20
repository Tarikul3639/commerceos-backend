import { ApiProperty } from "@nestjs/swagger"

import { SalesSummaryResponseDto } from "./sales-summary-response.dto"
import { PurchaseSummaryResponseDto } from "./purchase-summary-response.dto"
import { StockSummaryResponseDto } from "./stock-summary-response.dto"
import { OrderSummaryResponseDto } from "./order-summary-response.dto"
import { CustomerSummaryResponseDto } from "./customer-summary-response.dto"
import { EmployeeSummaryResponseDto } from "./employee-summary-response.dto"
import { TopProductItemDto } from "./top-products-response.dto"
import { TopCustomerItemDto } from "./top-customers-response.dto"
import { LowStockProductItemDto } from "./low-stock-products-response.dto"
import { RecentActivityItemDto } from "./recent-activities-response.dto"

export class DashboardOverviewResponseDto {
    @ApiProperty({
        type: () => SalesSummaryResponseDto,
    })
    sales!: SalesSummaryResponseDto

    @ApiProperty({
        type: () => PurchaseSummaryResponseDto,
    })
    purchases!: PurchaseSummaryResponseDto

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
        type: () => EmployeeSummaryResponseDto,
    })
    employees!: EmployeeSummaryResponseDto

    @ApiProperty({
        type: [TopProductItemDto],
    })
    topProducts!: TopProductItemDto[]

    @ApiProperty({
        type: [TopCustomerItemDto],
    })
    topCustomers!: TopCustomerItemDto[]

    @ApiProperty({
        type: [LowStockProductItemDto],
    })
    lowStockProducts!: LowStockProductItemDto[]

    @ApiProperty({
        type: [RecentActivityItemDto],
    })
    recentActivities!: RecentActivityItemDto[]
}