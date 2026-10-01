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
} from 'class-validator';

/*
 * DTO: UpdateProductDto
 */

export class UpdateProductDto {
    /*
     * Basic Info
     */

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

    /*
     * Identifiers & Pricing
     */

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

    /*
     * Stock & Attributes
     */

    @ApiPropertyOptional({ minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sizes?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    colors?: unknown;

    /*
     * Relations & Flags
     */

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
