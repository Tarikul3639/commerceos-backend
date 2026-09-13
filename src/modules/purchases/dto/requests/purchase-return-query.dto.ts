import {
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    PurchaseReturnStatus,
} from '@/lib/prisma/client';

export class PurchaseReturnQueryDto {
    @ApiPropertyOptional({
        example: 'return',
        description: 'Search by return number',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        enum: PurchaseReturnStatus,
        example: PurchaseReturnStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(PurchaseReturnStatus)
    status?: PurchaseReturnStatus;

    @ApiPropertyOptional({
        example: 'cmf123purchaseid',
    })
    @IsOptional()
    @IsString()
    purchaseId?: string;

    @ApiPropertyOptional({
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({
        example: 10,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    limit?: number;
}