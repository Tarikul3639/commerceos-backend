import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    Min,
} from 'class-validator';

export class AddCartItemDto {
    @ApiProperty({
        example: 'cm123456789',
    })
    @IsString()
    @IsNotEmpty()
    variantId!: string;

    @ApiProperty({
        example: 2,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    quantity!: number;
}