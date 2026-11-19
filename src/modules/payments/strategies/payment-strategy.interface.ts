import { PaymentProvider } from '../../../infrastructure/database/generated/prisma/enums.js';

export interface CheckoutLineItem {
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: string;
}

export interface CreateCheckoutSessionInput {
  paymentId: string;
  orderId: string;
  invoiceNo: string;
  lineItems: CheckoutLineItem[];
  currency: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentStrategy {
  readonly provider: PaymentProvider;
  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult>;
}
