import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { StockMovementType } from '@/lib/prisma/client';

export class StockMovementQueryDto {
    @ApiPropertyOptional({
        example: 'cmf123variantid',
        description: 'Filter by product variant ID',
    })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
        description: 'Filter by warehouse ID',
    })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmf123userid',
        description: 'Filter by user ID',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        enum: StockMovementType,
        example: StockMovementType.ADJUSTMENT,
        description: 'Filter by stock movement type',
    })
    @IsOptional()
    @IsEnum(StockMovementType)
    type?: StockMovementType;

    @ApiPropertyOptional({
        example: '1',
        default: '1',
        description: 'Page number',
    })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiPropertyOptional({
        example: '10',
        default: '10',
        description: 'Items per page',
    })
    @IsOptional()
    @IsString()
    limit?: string;
}