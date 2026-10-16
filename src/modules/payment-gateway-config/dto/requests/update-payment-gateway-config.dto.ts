
import { PartialType } from '@nestjs/swagger';
import { CreatePaymentGatewayConfigDto } from './create-payment-gateway-config.dto';

export class UpdatePaymentGatewayConfigDto extends PartialType(
    CreatePaymentGatewayConfigDto,
) { }
