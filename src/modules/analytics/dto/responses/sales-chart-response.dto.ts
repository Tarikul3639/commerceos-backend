import { ApiProperty } from '@nestjs/swagger';

export class SalesChartItemDto {
    @ApiProperty({
        example: '2026-09-15',
    })
    date!: string;

    @ApiProperty({
        example: '150000',
    })
    sales!: string;

    @ApiProperty({
        example: 42,
    })
    orders!: number;
}

export class SalesChartResponseDto {
    @ApiProperty({
        type: [SalesChartItemDto],
    })
    data!: SalesChartItemDto[];
}