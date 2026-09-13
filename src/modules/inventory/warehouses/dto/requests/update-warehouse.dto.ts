import {
    IsBoolean,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseDto {
    @ApiPropertyOptional({
        example: 'Updated Main Warehouse',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({
        example: 'Gazipur, Dhaka, Bangladesh',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string | null;

    @ApiPropertyOptional({
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}