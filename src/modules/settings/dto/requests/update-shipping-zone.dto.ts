import { PartialType } from '@nestjs/swagger';
import { CreateShippingZoneDto } from './create-shipping-zone.dto.js';

export class UpdateShippingZoneDto extends PartialType(CreateShippingZoneDto) {}
