import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

import {
    ActivityModule,
    ActivityType,
} from '@/lib/prisma/client';

export class ActivityLogQueryDto {
    @ApiPropertyOptional({
        enum: ActivityType,
    })
    @IsOptional()
    @IsEnum(ActivityType)
    type?: ActivityType;

    @ApiPropertyOptional({
        enum: ActivityModule,
    })
    @IsOptional()
    @IsEnum(ActivityModule)
    module?: ActivityModule;

    @ApiPropertyOptional({
        example: 'CREATE',
    })
    @IsOptional()
    @IsString()
    action?: string;

    @ApiPropertyOptional({
        example: 'Order',
    })
    @IsOptional()
    @IsString()
    entityType?: string;

    @ApiPropertyOptional({
        example: 'cm123456',
    })
    @IsOptional()
    @IsString()
    entityId?: string;

    @ApiPropertyOptional({
        example: 'cm123456',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({
        example: 'order',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @ApiPropertyOptional({
        example: 20,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 20;
}