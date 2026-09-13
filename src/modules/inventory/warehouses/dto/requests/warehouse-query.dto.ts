import {
    IsIn,
    IsOptional,
    IsString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class WarehouseQueryDto {
    @ApiPropertyOptional({
        example: 'main',
        description: 'Search warehouses by name',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'true',
        enum: ['true', 'false'],
        description: 'Filter warehouses by active status',
    })
    @IsOptional()
    @IsIn(['true', 'false'])
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