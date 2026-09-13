import {
    ArrayMinSize,
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

class StockTransferItemDto {
    @ApiProperty({
        example: 'cmf123variantid',
        description: 'Product variant ID',
    })
    @IsString()
    @IsNotEmpty()
    variantId!: string;

    @ApiProperty({
        example: 10,
        description: 'Quantity to transfer',
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class CreateStockTransferDto {
    @ApiProperty({
        example: 'cmf123warehouseid',
        description: 'Source warehouse ID',
    })
    @IsString()
    @IsNotEmpty()
    fromWarehouseId!: string;

    @ApiProperty({
        example: 'cmf456warehouseid',
        description: 'Destination warehouse ID',
    })
    @IsString()
    @IsNotEmpty()
    toWarehouseId!: string;

    @ApiProperty({
        type: [StockTransferItemDto],
        description: 'Items to transfer',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => StockTransferItemDto)
    items!: StockTransferItemDto[];

    @ApiPropertyOptional({
        example: 'Urgent stock transfer to Gazipur warehouse',
        description: 'Optional transfer note',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}