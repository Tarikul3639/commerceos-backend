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

export class UpdateProductDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    slug?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string | null;

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
        example: [{ name: 'Red', hex: '#FF0000' }],
    })
    @IsOptional()
    colors?: unknown;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    brandId?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @IsString()
    publicId?: string | null;

    @ApiPropertyOptional({
        type: [UpdateProductImageDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateProductImageDto)
    images?: UpdateProductImageDto[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}