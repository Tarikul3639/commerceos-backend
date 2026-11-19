import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto.js';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
