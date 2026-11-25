import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ProductStatus } from '../../../../../infrastructure/database/generated/prisma/enums.js';

export class ProductQueryDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of products per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'T-Shirt',
    description: 'Search products by name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'cm123category456',
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'cm123brand456',
    description: 'Filter by brand ID',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    example: 500,
    minimum: 0,
    description: 'Minimum listed product price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 5000,
    minimum: 0,
    description: 'Maximum listed product price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Only include products with available variant stock',
  })
  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === true || value === 'true',
  )
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    enum: ProductStatus,
    enumName: 'ProductStatus',
    description: 'Filter by product status',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter products by featured status',
  })
  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === true || value === 'true',
  )
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'sellingPrice'],
    default: 'createdAt',
    description: 'Product sort field',
  })
  @IsOptional()
  @IsIn(['createdAt', 'name', 'sellingPrice'])
  sortBy?: 'createdAt' | 'name' | 'sellingPrice' = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Product sort direction',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
