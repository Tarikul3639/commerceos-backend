import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateEmployeeDto {
    @ApiProperty({
        example: 'Senior Sales Executive',
    })
    @IsString()
    designation!: string;

    @ApiPropertyOptional({
        example: 25000,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salary?: number;

    @ApiProperty({
        example: '2026-09-15',
    })
    @IsDateString()
    joiningDate!: string;

    @ApiProperty({
        example: 'cm123456789',
    })
    @IsString()
    userId!: string;
}