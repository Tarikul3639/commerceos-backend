import { ApiProperty } from '@nestjs/swagger'

export class SalesPurchaseChartItemDto {
    @ApiProperty({
        example: '2026-09-15',
        description: 'Date of the sales and purchase data',
    })
    date!: string

    @ApiProperty({
        example: '150000',
        description: 'Total sales amount for the date',
    })
    sales!: string

    @ApiProperty({
        example: '85000',
        description: 'Total purchase amount for the date',
    })
    purchases!: string

    @ApiProperty({
        example: 42,
        description: 'Total number of orders for the date',
    })
    orders!: number
}