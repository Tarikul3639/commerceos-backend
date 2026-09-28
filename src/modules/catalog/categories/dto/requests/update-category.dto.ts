import {
    IsBoolean,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiPropertyOptional({
        example: 'Electronics',
    })
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(150)
    @ApiPropertyOptional({
        example: 'electronics',
    })
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    @ApiPropertyOptional({
        example: 'Electronic devices and accessories',
    })
    description?: string;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional({
        example: true,
    })
    isActive?: boolean;
}