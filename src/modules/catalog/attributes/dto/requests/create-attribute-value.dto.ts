import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeValueDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @ApiProperty({
        description: 'Value of the product attribute',
        example: 'Red',
    })
    value!: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiPropertyOptional({
        description:
            'Minimum stock quantity before this variant is considered low in stock',
        example: 5,
        default: 0,
    })
    minimumStock?: number;
}
