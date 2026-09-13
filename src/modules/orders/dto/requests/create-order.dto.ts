import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
    @ApiProperty({
        example: 'cmabc123variant',
    })
    @IsString()
    @IsNotEmpty()
    variantId!: string;

    @ApiProperty({
        example: 2,
        minimum: 1,
    })
    @IsInt()
    @IsPositive()
    quantity!: number;

    @ApiProperty({
        example: '500.00',
    })
    @IsString()
    @IsNotEmpty()
    unitPrice!: string;
}

export class CreateOrderDto {
    @ApiProperty({
        example: 'cmabc123customer',
    })
    @IsString()
    @IsNotEmpty()
    customerId!: string;

    @ApiProperty({
        example: 'cmabc123warehouse',
    })
    @IsString()
    @IsNotEmpty()
    warehouseId!: string;

    @ApiPropertyOptional({
        example: '100.00',
        default: '0',
    })
    @IsOptional()
    @IsString()
    discount?: string;

    @ApiPropertyOptional({
        example: '50.00',
        default: '0',
    })
    @IsOptional()
    @IsString()
    tax?: string;

    @ApiProperty({
        type: [CreateOrderItemDto],
        minItems: 1,
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({
        each: true,
    })
    @Type(() => CreateOrderItemDto)
    items!: CreateOrderItemDto[];
}