import { Injectable } from "@nestjs/common"

import { AnalyticsQueryDto } from "../dto/requests/analytics-query.dto"
import { AnalyticsOverviewResponseDto } from "../dto/responses/analytics-overview-response.dto"

import { GetRevenueChartService } from "./get-revenue-chart.service"
import { GetSalesChartService } from "./get-sales-chart.service"
import { GetPurchaseChartService } from "./get-purchase-chart.service"

@Injectable()
export class GetAnalyticsOverviewService {
    constructor(
        private readonly revenueChartService: GetRevenueChartService,
        private readonly salesChartService: GetSalesChartService,
        private readonly purchaseChartService: GetPurchaseChartService,
    ) {}

    async execute(
        query: AnalyticsQueryDto,
    ): Promise<AnalyticsOverviewResponseDto> {
        const [
            revenue,
            sales,
            purchases,
        ] = await Promise.all([
            this.revenueChartService.execute(query),
            this.salesChartService.execute(query),
            this.purchaseChartService.execute(query),
        ])

        return {
            revenue,
            sales,
            purchases,
        }
    }
}