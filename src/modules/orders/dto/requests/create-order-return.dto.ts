import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateOrderReturnItemDto {
    @ApiProperty({
        example: 'cmabc123orderitem',
    })
    @IsString()
    @IsNotEmpty()
    orderItemId!: string;

    @ApiProperty({
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    quantity!: number;

    @ApiPropertyOptional({
        example: 'Damaged product',
    })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class CreateOrderReturnDto {
    @ApiPropertyOptional({
        example: 'Customer received damaged products',
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        type: [CreateOrderReturnItemDto],
        minItems: 1,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({
        each: true,
    })
    @Type(() => CreateOrderReturnItemDto)
    items!: CreateOrderReturnItemDto[];
}