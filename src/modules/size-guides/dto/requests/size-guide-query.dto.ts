
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SizeGuideQueryDto {
    @ApiPropertyOptional({ example: 'Panjabi' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 10;
}
