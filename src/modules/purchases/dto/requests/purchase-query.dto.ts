import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { PurchaseStatus } from '@/lib/prisma/client';

export class PurchaseQueryDto {
    @ApiPropertyOptional({
        example: 'nike',
        description: 'Search by invoice number or supplier name',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        enum: PurchaseStatus,
        example: PurchaseStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(PurchaseStatus)
    status?: PurchaseStatus;

    @ApiPropertyOptional({
        example: 'cmf123supplierid',
    })
    @IsOptional()
    @IsString()
    supplierId?: string;

    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
    })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiPropertyOptional({
        example: 1,
        default: 1,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({
        example: 10,
        default: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @ApiPropertyOptional({
        example: '2026-09-01',
        description: 'Purchase start date',
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2026-09-30',
        description: 'Purchase end date',
    })
    @IsOptional()
    @IsString()
    endDate?: string;
}