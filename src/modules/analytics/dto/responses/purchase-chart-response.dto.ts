import { ApiProperty } from '@nestjs/swagger';

export class PurchaseChartItemDto {
    @ApiProperty({
        example: '2026-09-15',
    })
    date!: string;

    @ApiProperty({
        example: '85000',
    })
    purchases!: string;
}

export class PurchaseChartResponseDto {
    @ApiProperty({
        type: [PurchaseChartItemDto],
    })
    data!: PurchaseChartItemDto[];
}