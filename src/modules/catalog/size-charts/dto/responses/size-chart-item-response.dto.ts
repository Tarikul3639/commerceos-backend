import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SizeChartItemResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 'M' })
    size!: string;

    @ApiPropertyOptional({ nullable: true })
    chest!: string | null;

    @ApiPropertyOptional({ nullable: true })
    length!: string | null;

    @ApiPropertyOptional({ nullable: true })
    shoulder!: string | null;

    @ApiPropertyOptional({ nullable: true })
    sleeve!: string | null;

    @ApiPropertyOptional({ nullable: true })
    waist!: string | null;

    @ApiPropertyOptional({ nullable: true })
    hip!: string | null;

    @ApiPropertyOptional({ nullable: true })
    inseam!: string | null;

    @ApiProperty()
    sizeChartId!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}