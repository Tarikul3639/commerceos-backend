import { ApiProperty } from '@nestjs/swagger';

export class SalesSummaryResponseDto {
    @ApiProperty({
        example: '1250000',
    })
    totalSales!: string;

    @ApiProperty({
        example: '45000',
    })
    todaySales!: string;

    @ApiProperty({
        example: '85000',
    })
    averageOrderValue!: string;

    @ApiProperty({
        example: 1248,
    })
    totalOrders!: number;

    @ApiProperty({
        example: 12.5,
    })
    salesGrowth!: number;
}