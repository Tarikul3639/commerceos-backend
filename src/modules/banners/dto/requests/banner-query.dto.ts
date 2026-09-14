import {
    IsBoolean,
    IsEnum,
    IsOptional,
} from 'class-validator';

import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    BannerPosition,
    BannerType,
} from '@/lib/prisma/client';

export class BannerQueryDto {
    @ApiPropertyOptional({
        example: '1',
        default: '1',
    })
    @IsOptional()
    page?: string;

    @ApiPropertyOptional({
        example: '10',
        default: '10',
    })
    @IsOptional()
    limit?: string;

    @ApiPropertyOptional({
        enum: BannerType,
    })
    @IsOptional()
    @IsEnum(BannerType)
    type?: BannerType;

    @ApiPropertyOptional({
        enum: BannerPosition,
    })
    @IsOptional()
    @IsEnum(BannerPosition)
    position?: BannerPosition;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;

        return value;
    })
    @IsBoolean()
    isActive?: boolean;
}