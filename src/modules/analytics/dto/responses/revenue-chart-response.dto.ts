import { ApiProperty } from '@nestjs/swagger';

export class RevenueChartItemDto {
    @ApiProperty({
        example: '2026-09-15',
    })
    date!: string;

    @ApiProperty({
        example: '125000',
    })
    revenue!: string;
}

export class RevenueChartResponseDto {
    @ApiProperty({
        type: [RevenueChartItemDto],
    })
    data!: RevenueChartItemDto[];
}