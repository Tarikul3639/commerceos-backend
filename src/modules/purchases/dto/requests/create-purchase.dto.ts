import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumberString,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseItemDto {
    @ApiProperty({
        example: 'cmf123variantid',
        description: 'Product variant ID',
    })
    @IsString()
    @IsNotEmpty()
    variantId!: string;

    @ApiProperty({
        example: 10,
        description: 'Quantity to purchase',
        minimum: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity!: number;

    @ApiProperty({
        example: '500.00',
        description: 'Purchase price per unit',
    })
    @IsNumberString()
    unitPrice!: string;
}

export class CreatePurchaseDto {
    @ApiProperty({
        example: 'cmf123supplierid',
        description: 'Supplier ID',
    })
    @IsString()
    @IsNotEmpty()
    supplierId!: string;

    @ApiProperty({
        example: 'cmf123warehouseid',
        description: 'Warehouse where stock will be received',
    })
    @IsString()
    @IsNotEmpty()
    warehouseId!: string;

    @ApiProperty({
        type: [CreatePurchaseItemDto],
        example: [
            {
                variantId: 'cmf123variantid',
                quantity: 10,
                unitPrice: '500.00',
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseItemDto)
    items!: CreatePurchaseItemDto[];

    @ApiProperty({
        example: '100.00',
        required: false,
        default: '0',
    })
    @IsNumberString()
    discount?: string;

    @ApiProperty({
        example: '50.00',
        required: false,
        default: '0',
    })
    @IsNumberString()
    tax?: string;
}