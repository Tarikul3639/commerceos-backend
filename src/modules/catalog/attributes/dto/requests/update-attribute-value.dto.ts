import { CreateAttributeValueDto } from './create-attribute-value.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateAttributeValueDto extends PartialType(CreateAttributeValueDto) {}