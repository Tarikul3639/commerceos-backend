import { PartialType, OmitType } from '@nestjs/swagger';

import { CreateProductOptionDto } from './create-product-option.dto';

export class UpdateProductOptionDto extends PartialType(
    OmitType(CreateProductOptionDto, ['productId', 'values'] as const),
) { }
