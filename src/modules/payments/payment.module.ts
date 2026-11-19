import { Module } from '@nestjs/common';
import { StripeClient } from '../../infrastructure/payment-gateways/stripe/stripe.client.js';
import { StripeStrategy } from '../../infrastructure/payment-gateways/stripe/stripe.strategy.js';
import { PaymentController } from './controllers/payment.controller.js';
import { StripeWebhookController } from './controllers/stripe-webhook.controller.js';
import { RefundController } from './controllers/refund.controller.js';
import { PaymentStrategyFactory } from './strategies/payment-strategy.factory.js';
import { CreatePaymentService } from './services/create-payment.service.js';
import { CreateRefundService } from './services/create-refund.service.js';
import { GetPaymentService } from './services/get-payment.service.js';
import { GetPaymentsService } from './services/get-payments.service.js';
import { HandleStripeWebhookService } from './services/handle-stripe-webhook.service.js';
import { UpdatePaymentStatusService } from './services/update-payment-status.service.js';

@Module({
  controllers: [PaymentController, RefundController, StripeWebhookController],
  providers: [
    StripeClient,
    StripeStrategy,
    {
      provide: PaymentStrategyFactory,
      useFactory: (stripeStrategy: StripeStrategy) =>
        new PaymentStrategyFactory([stripeStrategy]),
      inject: [StripeStrategy],
    },
    CreatePaymentService,
    CreateRefundService,
    GetPaymentService,
    GetPaymentsService,
    UpdatePaymentStatusService,
    HandleStripeWebhookService,
  ],
  exports: [CreatePaymentService, GetPaymentService],
})
export class PaymentModule {}
