import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum AnalyticsPeriod {
    SEVEN_DAYS = '7d',
    THIRTY_DAYS = '30d',
    THREE_MONTHS = '3m',
    SIX_MONTHS = '6m',
    ONE_YEAR = '1y',
}

export class AnalyticsQueryDto {
    @ApiPropertyOptional({
        description: 'Start date for analytics',
        example: '2026-09-01',
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'End date for analytics',
        example: '2026-09-20',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Analytics period',
        enum: AnalyticsPeriod,
        default: AnalyticsPeriod.THIRTY_DAYS,
        example: AnalyticsPeriod.THIRTY_DAYS,
    })
    @IsOptional()
    @IsEnum(AnalyticsPeriod)
    period: AnalyticsPeriod = AnalyticsPeriod.THIRTY_DAYS;
}
