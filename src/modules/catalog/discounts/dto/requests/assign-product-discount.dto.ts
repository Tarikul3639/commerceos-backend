import {
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsNotEmpty,
    IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AssignProductDiscountDto {
    @ApiProperty({
        example: [
            'cmfproduct123',
            'cmfproduct456',
        ],
        description:
            'List of product IDs to assign the discount',
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsString({
        each: true,
    })
    @IsNotEmpty({
        each: true,
    })
    productIds!: string[];
}