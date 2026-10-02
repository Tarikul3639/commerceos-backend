import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UpdateProductImageDto } from './update-product-image.dto';
import { ProductColorDto } from './create-product.dto';

export class UpdateProductDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    subDescription?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    sku?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    barcode?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(0)
    sellingPrice?: number;

    @ApiPropertyOptional({ minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sizes?: string[];

    @ApiPropertyOptional({
        type: [ProductColorDto],
        example: [
            { name: 'Red', hex: '#FF0000' },
            { name: 'Black', hex: '#000000' },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductColorDto)
    colors?: ProductColorDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    brandId?: string | null;

    @ApiPropertyOptional({
        type: [UpdateProductImageDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductImageDto)
    images?: UpdateProductImageDto[];

    @ApiPropertyOptional({
        type: [String],
        description: 'IDs of existing product images to remove',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    imageIdsToDelete?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
