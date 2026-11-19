import { PartialType } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto.js';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
