import { PartialType } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto.js';

export class UpdateProductVariantDto extends PartialType(
  CreateProductVariantDto,
) {}
