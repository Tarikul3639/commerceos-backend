import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ProductOptionType } from '@/lib/prisma/client';

export class ProductOptionValueDto {
  @ApiProperty({ example: 'Red' })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ example: '#ff0000', nullable: true })
  @IsOptional()
  @IsString()
  colorHex?: string | null;
}

export class CreateProductOptionDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: ProductOptionType, default: ProductOptionType.CUSTOM })
  @IsOptional()
  @IsEnum(ProductOptionType)
  type?: ProductOptionType;

  @ApiProperty({ type: [ProductOptionValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values!: ProductOptionValueDto[];
}
