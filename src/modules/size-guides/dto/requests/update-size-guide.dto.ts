import { PartialType } from '@nestjs/swagger';
import { CreateSizeGuideDto } from './create-size-guide.dto';

export class UpdateSizeGuideDto extends PartialType(CreateSizeGuideDto) {}
