import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsOptional,
} from 'class-validator';

export enum DashboardPeriod {
    SEVEN_DAYS = '7d',
    THIRTY_DAYS = '30d',
    THREE_MONTHS = '3m',
    SIX_MONTHS = '6m',
    ONE_YEAR = '1y',
}

export class DashboardQueryDto {
    @ApiPropertyOptional({
        example: '2026-09-01',
        description: 'Start date for dashboard analytics',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2026-09-15',
        description: 'End date for dashboard analytics',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        example: '30d',
        enum: DashboardPeriod,
        default: DashboardPeriod.THIRTY_DAYS,
    })
    @IsOptional()
    @IsEnum(DashboardPeriod)
    period: DashboardPeriod = DashboardPeriod.THIRTY_DAYS;
}