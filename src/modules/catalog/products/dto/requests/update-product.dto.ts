import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateProductDto } from './create-product.dto.js';
import { ProductDiscountDto } from './product-discount.dto.js';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ type: ProductDiscountDto, nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDiscountDto)
  productDiscount?: ProductDiscountDto | null;
}
