import { ApiProperty } from '@nestjs/swagger';

export class StockSummaryResponseDto {
    @ApiProperty({
        example: 1250,
    })
    totalProducts!: number;

    @ApiProperty({
        example: 3840,
    })
    totalVariants!: number;

    @ApiProperty({
        example: 45820,
    })
    totalStockQuantity!: number;

    @ApiProperty({
        example: '8450000',
    })
    totalStockValue!: string;

    @ApiProperty({
        example: 42,
    })
    lowStockCount!: number;

    @ApiProperty({
        example: 17,
    })
    outOfStockCount!: number;
}