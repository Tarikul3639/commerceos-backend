import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller.js';
import { RefundController } from './controllers/refund.controller.js';
import { CreatePaymentService } from './services/create-payment.service.js';
import { CreateRefundService } from './services/create-refund.service.js';
import { GetPaymentService } from './services/get-payment.service.js';
import { GetPaymentsService } from './services/get-payments.service.js';
import { UpdatePaymentStatusService } from './services/update-payment-status.service.js';

@Module({
  controllers: [PaymentController, RefundController],
  providers: [
    CreatePaymentService,
    CreateRefundService,
    GetPaymentService,
    GetPaymentsService,
    UpdatePaymentStatusService,
  ],
  exports: [CreatePaymentService, GetPaymentService],
})
export class PaymentModule {}
