import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsIn,
    IsOptional,
} from 'class-validator';

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
        enum: ['7d', '30d', '3m', '6m', '1y'],
        default: '30d',
    })
    @IsOptional()
    @IsIn(['7d', '30d', '3m', '6m', '1y'])
    period?: string = '30d';
}