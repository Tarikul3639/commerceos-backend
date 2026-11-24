import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ProductOptionType } from '../../../../../infrastructure/database/generated/prisma/enums.js';

export class CreateProductOptionValueDto {
  @ApiProperty({ example: 'v1', description: 'Stable option value identifier' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Black' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
  colorCode?: string;
}

export class CreateProductOptionDto {
  @ApiProperty({ example: 'product-id' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: ProductOptionType, enumName: 'ProductOptionType' })
  @IsEnum(ProductOptionType)
  type!: ProductOptionType;

  @ApiProperty({ type: [CreateProductOptionValueDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductOptionValueDto)
  values!: CreateProductOptionValueDto[];

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
