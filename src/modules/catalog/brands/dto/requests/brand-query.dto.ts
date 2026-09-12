import {
    IsBooleanString,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class BrandQueryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Search brands by name',
        example: 'Nike',
    })
    search?: string;

    @IsOptional()
    @IsBooleanString()
    @ApiPropertyOptional({
        description: 'Filter brands by active status',
        example: 'true',
    })
    isActive?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'Page number',
        example: '1',
    })
    page?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: '10',
    })
    limit?: string;
}