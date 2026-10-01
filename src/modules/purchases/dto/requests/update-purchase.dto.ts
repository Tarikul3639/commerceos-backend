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

/*
 * DTO: UpdatePurchaseItemDto
 */

export class UpdatePurchaseItemDto {
    /*
     * Item Details
     */

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    productId?: string;

    @ApiPropertyOptional({ minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    unitPrice?: string;
}

/*
 * DTO: UpdatePurchaseDto
 */

export class UpdatePurchaseDto {
    /*
     * Supplier & Line Items
     */

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    supplierId?: string;

    @ApiPropertyOptional({ type: [UpdatePurchaseItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdatePurchaseItemDto)
    items?: UpdatePurchaseItemDto[];

    /*
     * Financial Adjustments
     */

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    discount?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString()
    tax?: string;
}