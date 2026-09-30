import { ApiProperty } from '@nestjs/swagger';
import { SizeChartItemResponseDto } from './size-chart-item-response.dto';

export class SizeChartResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 'Men Clothing' })
    name!: string;

    @ApiProperty({ type: [SizeChartItemResponseDto] })
    items!: SizeChartItemResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}