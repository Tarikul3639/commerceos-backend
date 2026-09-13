import {
    IsEnum,
    IsOptional,
    IsString,
    Min,
    Max,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    StockTransferStatus,
} from '../../../../../lib/prisma/client';

export class StockTransferQueryDto {
    @ApiPropertyOptional({
        example: 1,
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        example: StockTransferStatus.PENDING,
        enum: StockTransferStatus,
    })
    @IsOptional()
    @IsEnum(StockTransferStatus)
    status?: StockTransferStatus;

    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
        description: 'Source warehouse ID',
    })
    @IsOptional()
    @IsString()
    fromWarehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmf456warehouseid',
        description: 'Destination warehouse ID',
    })
    @IsOptional()
    @IsString()
    toWarehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmf123userid',
        description: 'User who created the transfer',
    })
    @IsOptional()
    @IsString()
    userId?: string;
}