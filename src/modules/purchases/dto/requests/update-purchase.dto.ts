import {
    IsArray,
    IsInt,
    IsNumberString,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurchaseItemDto {
    @ApiPropertyOptional({
        example: 'cmf123variantid',
    })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiPropertyOptional({
        example: 10,
        minimum: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity?: number;

    @ApiPropertyOptional({
        example: '500.00',
    })
    @IsOptional()
    @IsNumberString()
    unitPrice?: string;
}

export class UpdatePurchaseDto {
    @ApiPropertyOptional({
        example: 'cmf123supplierid',
    })
    @IsOptional()
    @IsString()
    supplierId?: string;

    @ApiPropertyOptional({
        example: 'cmf123warehouseid',
    })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiPropertyOptional({
        type: [UpdatePurchaseItemDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePurchaseItemDto)
    items?: UpdatePurchaseItemDto[];

    @ApiPropertyOptional({
        example: '100.00',
    })
    @IsOptional()
    @IsNumberString()
    discount?: string;

    @ApiPropertyOptional({
        example: '50.00',
    })
    @IsOptional()
    @IsNumberString()
    tax?: string;
}