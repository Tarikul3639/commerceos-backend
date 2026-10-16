import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { RefundController } from './controllers/refund.controller';
import { CreatePaymentService } from './services/create-payment.service';
import { CreateRefundService } from './services/create-refund.service';
import { GetPaymentService } from './services/get-payment.service';
import { GetPaymentsService } from './services/get-payments.service';
import { UpdatePaymentStatusService } from './services/update-payment-status.service';
import { PaymentProviderFactory } from '@/integrations/payments/factories/payment.factory';

@Module({
  controllers: [
    PaymentController,
    RefundController,
  ],
  providers: [
    CreatePaymentService,
    CreateRefundService,
    GetPaymentService,
    GetPaymentsService,
    UpdatePaymentStatusService,
    PaymentProviderFactory,
  ],
  exports: [CreatePaymentService, GetPaymentService],
})
export class PaymentModule { }
