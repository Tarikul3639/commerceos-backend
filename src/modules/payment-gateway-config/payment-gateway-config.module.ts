import { Module } from "@nestjs/common"

import { PaymentGatewayConfigController } from "./controllers/payment-gateway-config.controller"
import { CreatePaymentGatewayConfigService } from "./services/create-payment-gateway-config.service"
import { GetPaymentGatewayConfigService } from "./services/get-payment-gateway-config.service"
import { GetPaymentGatewayConfigsService } from "./services/get-payment-gateway-configs.service"
import { UpdatePaymentGatewayConfigService } from "./services/update-payment-gateway-config.service"

@Module({
  controllers: [PaymentGatewayConfigController],
  providers: [
    CreatePaymentGatewayConfigService,
    GetPaymentGatewayConfigService,
    GetPaymentGatewayConfigsService,
    UpdatePaymentGatewayConfigService,
  ],
  exports: [
    GetPaymentGatewayConfigService,
    GetPaymentGatewayConfigsService,
  ],
})
export class PaymentGatewayConfigModule {}