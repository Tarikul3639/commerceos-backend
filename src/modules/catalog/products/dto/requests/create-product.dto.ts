import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { ProductStatus } from '@/lib/prisma/client';

export class ProductImageInputDto {
  @ApiProperty({ example: 'https://cdn.example.com/images/1.jpg' })
  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @ApiProperty({ example: 'product-1-image-1' })
  @IsString()
  @IsNotEmpty()
  publicId!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class ProductDiscountInputDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z', nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string | null;

  @ApiPropertyOptional({ example: '2026-10-31T23:59:59.000Z', nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string | null;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Max 270' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Comfortable running shoe' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Lightweight everyday runner' })
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

  @ApiProperty({ example: 'category_123' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'brand_123' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ type: [ProductImageInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  images?: ProductImageInputDto[];

  @ApiPropertyOptional({ type: ProductDiscountInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDiscountInputDto)
  discount?: ProductDiscountInputDto;
}
