import {
    IsOptional,
    IsString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
    @ApiPropertyOptional({
        example: 'nike',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'cmf123categoryid',
    })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({
        example: 'cmf123brandid',
    })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({
        example: 'true',
        enum: ['true', 'false'],
    })
    @IsOptional()
    @IsString()
    isActive?: string;

    @ApiPropertyOptional({
        example: '1',
        default: '1',
    })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiPropertyOptional({
        example: '10',
        default: '10',
    })
    @IsOptional()
    @IsString()
    limit?: string;
}