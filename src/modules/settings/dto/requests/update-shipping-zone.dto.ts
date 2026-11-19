import { PartialType } from '@nestjs/swagger';
import { CreateShippingZoneDto } from './create-shipping-zone.dto';

export class UpdateShippingZoneDto extends PartialType(CreateShippingZoneDto) {}
