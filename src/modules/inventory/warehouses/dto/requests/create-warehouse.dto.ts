import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
    @ApiProperty({
        example: 'Main Warehouse',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiPropertyOptional({
        example: 'Dhaka, Bangladesh',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}