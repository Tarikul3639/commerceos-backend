import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSizeChartItemDto {
    @ApiProperty({ example: 'M' })
    @IsString()
    @IsNotEmpty()
    size!: string;

    @ApiPropertyOptional({ example: 38 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    chest?: number;

    @ApiPropertyOptional({ example: 27 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    length?: number;

    @ApiPropertyOptional({ example: 17 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    shoulder?: number;

    @ApiPropertyOptional({ example: 24 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sleeve?: number;

    @ApiPropertyOptional({ example: 36 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    waist?: number;

    @ApiPropertyOptional({ example: 40 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    hip?: number;

    @ApiPropertyOptional({ example: 28 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    inseam?: number;
}