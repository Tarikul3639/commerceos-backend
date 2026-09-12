import {
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttributeDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Name of the product attribute',
        example: 'Size',
    })
    name?: string;
}