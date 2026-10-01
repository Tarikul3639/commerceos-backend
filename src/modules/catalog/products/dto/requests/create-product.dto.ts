import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Nike Air Max 270' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name!: string;

    @ApiProperty({ example: 'nike-air-max-270' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    slug!: string;

    @ApiProperty({ example: 'nike-air-max-270-black' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    sku!: string;

    @ApiPropertyOptional({ example: '012345678905' })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiPropertyOptional({ example: 'Comfortable running shoes' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 100 })
    @IsNumber()
    @Min(0)
    purchasePrice!: number;

    @ApiProperty({ example: 150 })
    @IsNumber()
    @Min(0)
    sellingPrice!: number;

    @ApiPropertyOptional({ example: 10, minimum: 0, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ type: [String], example: ['S', 'M', 'L'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    sizes?: string[];

    @ApiPropertyOptional({ example: [{ name: 'Red', hex: '#FF0000' }] })
    @IsOptional()
    colors?: unknown;

    @ApiProperty({ example: 'cmf123categoryid' })
    @IsString()
    @IsNotEmpty()
    categoryId!: string;

    @ApiPropertyOptional({ example: 'cmf123brandid' })
    @IsOptional()
    @IsString()
    brandId?: string;

    @ApiPropertyOptional({ example: 'products/nike-air-max-270' })
    @IsOptional()
    @IsString()
    publicId?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
