import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateAttributeDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
        description: 'Name of the product attribute',
        example: 'Color',
    })
    name!: string;
}