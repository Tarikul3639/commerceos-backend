import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ProductOptionType } from '@/lib/prisma/client';

export class UpdateProductOptionDto {
  @ApiPropertyOptional({ example: 'Color' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ProductOptionType })
  @IsOptional()
  @IsEnum(ProductOptionType)
  type?: ProductOptionType;
}
