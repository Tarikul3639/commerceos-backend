import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreatePurchaseReturnItemDto {
    @ApiProperty({
        example: 'cmf123purchaseitemid',
        description: 'Original purchase item ID',
    })
    @IsString()
    @IsNotEmpty()
    purchaseItemId!: string;

    @ApiProperty({
        example: 2,
        minimum: 1,
        description: 'Quantity to return',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity!: number;

    @ApiPropertyOptional({
        example: 'Damaged product',
    })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class CreatePurchaseReturnDto {
    @ApiProperty({
        example: 'cmf123purchaseid',
        description: 'Purchase ID',
    })
    @IsString()
    @IsNotEmpty()
    purchaseId!: string;

    @ApiPropertyOptional({
        example: 'Some products were damaged',
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({
        type: [CreatePurchaseReturnItemDto],
        example: [
            {
                purchaseItemId: 'cmf123purchaseitemid',
                quantity: 2,
                reason: 'Damaged',
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseReturnItemDto)
    items!: CreatePurchaseReturnItemDto[];
}