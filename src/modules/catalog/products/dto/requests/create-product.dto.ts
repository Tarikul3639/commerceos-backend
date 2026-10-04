import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  IsDateString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { AddProductImageDto } from '@/modules/catalog/products/dto/requests/add-product-image.dto';

export class DiscountInputDto {
  @ApiProperty({ example: 15, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  value!: number;

  @ApiPropertyOptional({ nullable: true, example: '2026-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-10-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

export class ProductColorDto {
  @ApiProperty({ example: 'Red' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '#FF0000' })
  @IsString()
  @IsNotEmpty()
  hex!: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Max 270' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

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

  @ApiPropertyOptional({
    example: 'Lightweight running shoes for everyday comfort',
  })
  @IsOptional()
  @IsString()
  subDescription?: string;

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

  @ApiPropertyOptional({
    type: [String],
    example: ['S', 'M', 'L'],
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

  @ApiProperty({
    example: 'cmf123categoryid',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    example: 'cmf123brandid',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    type: [AddProductImageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProductImageDto)
  images?: AddProductImageDto[];

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: DiscountInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountInputDto)
  discount?: DiscountInputDto;
}
