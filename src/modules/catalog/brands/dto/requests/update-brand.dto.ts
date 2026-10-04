import { PartialType } from '@nestjs/swagger';
import { CreateBrandDto } from '@/modules/catalog/brands/dto/requests/create-brand.dto';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
