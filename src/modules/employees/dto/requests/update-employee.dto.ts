import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class UpdateEmployeeDto {
    @ApiPropertyOptional({
        example: 'Senior Sales Executive',
    })
    @IsOptional()
    @IsString()
    designation?: string;

    @ApiPropertyOptional({
        example: 30000,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salary?: number;

    @ApiPropertyOptional({
        example: '2026-09-15',
    })
    @IsOptional()
    @IsDateString()
    joiningDate?: string;
}