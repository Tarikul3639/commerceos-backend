import {
    IsBooleanString,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { DiscountType } from '../../../../../lib/prisma/client';

export class DiscountQueryDto {
    @ApiPropertyOptional({
        example: 'eid',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        enum: DiscountType,
    })
    @IsOptional()
    @IsEnum(DiscountType)
    type?: DiscountType;

    @ApiPropertyOptional({
        example: 'true',
    })
    @IsOptional()
    @IsBooleanString()
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