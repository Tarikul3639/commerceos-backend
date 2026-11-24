import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductVariantDto } from './create-product-variant.dto.js';

export class UpdateProductVariantDto extends PartialType(
  OmitType(CreateProductVariantDto, ['productId'] as const),
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
