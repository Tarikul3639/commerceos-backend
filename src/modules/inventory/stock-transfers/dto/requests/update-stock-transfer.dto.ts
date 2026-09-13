import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    ApiPropertyOptional,
} from '@nestjs/swagger';

class UpdateStockTransferItemDto {
    @ApiPropertyOptional({
        example: 'cmf123variantid',
        description: 'Product variant ID',
    })
    @IsString()
    variantId!: string;

    @ApiPropertyOptional({
        example: 20,
        minimum: 1,
        description: 'Quantity to transfer',
    })
    @IsInt()
    @Min(1)
    quantity!: number;
}

export class UpdateStockTransferDto {
    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
    })
    @IsOptional()
    @IsString()
    fromWarehouseId?: string;

    @ApiPropertyOptional({
        example: 'cmf456warehouseid',
    })
    @IsOptional()
    @IsString()
    toWarehouseId?: string;

    @ApiPropertyOptional({
        type: [UpdateStockTransferItemDto],
        description: 'Updated transfer items',
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => UpdateStockTransferItemDto)
    items?: UpdateStockTransferItemDto[];

    @ApiPropertyOptional({
        example: 'Updated transfer notes',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}