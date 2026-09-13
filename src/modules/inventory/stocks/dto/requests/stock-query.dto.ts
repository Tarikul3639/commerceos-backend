import {
    IsBooleanString,
    IsOptional,
    IsString,
} from 'class-validator';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class StockQueryDto {
    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
        description: 'Filter by warehouse',
    })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmf123variantid',
        description: 'Filter by product variant',
    })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiPropertyOptional({
        example: 'Nike',
        description: 'Search by product name or SKU',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 'true',
        description: 'Filter low stock items',
    })
    @IsOptional()
    @IsBooleanString()
    lowStock?: string;

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