import { ApiProperty } from '@nestjs/swagger';

import { SalesSummaryResponseDto } from './sales-summary-response.dto';
import { PurchaseSummaryResponseDto } from './purchase-summary-response.dto';
import { StockSummaryResponseDto } from './stock-summary-response.dto';
import { OrderSummaryResponseDto } from './order-summary-response.dto';
import { CustomerSummaryResponseDto } from './customer-summary-response.dto';
import { EmployeeSummaryResponseDto } from './employee-summary-response.dto';
import { RevenueChartResponseDto } from './revenue-chart-response.dto';
import { SalesChartResponseDto } from './sales-chart-response.dto';
import { PurchaseChartResponseDto } from './purchase-chart-response.dto';
import { TopProductsResponseDto } from './top-products-response.dto';
import { TopCustomersResponseDto } from './top-customers-response.dto';
import { LowStockProductsResponseDto } from './low-stock-products-response.dto';
import { RecentActivitiesResponseDto } from './recent-activities-response.dto';

export class DashboardOverviewResponseDto {
    @ApiProperty({
        type: SalesSummaryResponseDto,
    })
    sales!: SalesSummaryResponseDto;

    @ApiProperty({
        type: PurchaseSummaryResponseDto,
    })
    purchases!: PurchaseSummaryResponseDto;

    @ApiProperty({
        type: StockSummaryResponseDto,
    })
    stock!: StockSummaryResponseDto;

    @ApiProperty({
        type: OrderSummaryResponseDto,
    })
    orders!: OrderSummaryResponseDto;

    @ApiProperty({
        type: CustomerSummaryResponseDto,
    })
    customers!: CustomerSummaryResponseDto;

    @ApiProperty({
        type: EmployeeSummaryResponseDto,
    })
    employees!: EmployeeSummaryResponseDto;

    @ApiProperty({
        type: RevenueChartResponseDto,
    })
    revenueChart!: RevenueChartResponseDto;

    @ApiProperty({
        type: SalesChartResponseDto,
    })
    salesChart!: SalesChartResponseDto;

    @ApiProperty({
        type: PurchaseChartResponseDto,
    })
    purchaseChart!: PurchaseChartResponseDto;

    @ApiProperty({
        type: TopProductsResponseDto,
    })
    topProducts!: TopProductsResponseDto;

    @ApiProperty({
        type: TopCustomersResponseDto,
    })
    topCustomers!: TopCustomersResponseDto;

    @ApiProperty({
        type: LowStockProductsResponseDto,
    })
    lowStockProducts!: LowStockProductsResponseDto;

    @ApiProperty({
        type: RecentActivitiesResponseDto,
    })
    recentActivities!: RecentActivitiesResponseDto;
}