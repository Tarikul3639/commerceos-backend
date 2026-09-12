import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttributeValueDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({
        description: 'Value of the product attribute',
        example: 'Blue',
    })
    value?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiPropertyOptional({
        description:
            'Minimum stock quantity before this variant is considered low in stock',
        example: 10,
    })
    minimumStock?: number;
}