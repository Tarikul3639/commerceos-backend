import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBooleanString,
    IsEnum,
    IsInt,
    IsOptional,
    IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

import { NotificationType } from '@/lib/prisma/client';

export class NotificationQueryDto {
    @ApiPropertyOptional({
        enum: NotificationType,
    })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @ApiPropertyOptional({
        example: false,
    })
    @IsOptional()
    @IsBooleanString()
    isRead?: string;

    @ApiPropertyOptional({
        example: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    page?: number = 1;

    @ApiPropertyOptional({
        example: 20,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    limit?: number = 20;
}