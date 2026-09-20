import { ApiProperty } from "@nestjs/swagger"

import { RevenueChartResponseDto } from "./revenue-chart-response.dto"
import { SalesChartResponseDto } from "./sales-chart-response.dto"
import { PurchaseChartResponseDto } from "./purchase-chart-response.dto"

export class AnalyticsOverviewResponseDto {
    @ApiProperty({
        type: RevenueChartResponseDto,
        description: "Revenue analytics over the selected date range",
    })
    revenue!: RevenueChartResponseDto

    @ApiProperty({
        type: SalesChartResponseDto,
        description: "Sales analytics over the selected date range",
    })
    sales!: SalesChartResponseDto

    @ApiProperty({
        type: PurchaseChartResponseDto,
        description: "Purchase analytics over the selected date range",
    })
    purchases!: PurchaseChartResponseDto
}