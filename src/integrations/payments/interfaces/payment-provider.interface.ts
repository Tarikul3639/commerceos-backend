import { PaymentMethod } from '@/lib/prisma/enums';

export interface PaymentSession {
  paymentId: string;
  redirectUrl?: string;
  providerTransactionId?: string;
}

export interface PaymentVerification {
  transactionId: string;
  status: 'PAID' | 'FAILED' | 'PENDING';
  amount: string;
  currency: string;
}

export interface PaymentProvider {
  readonly method: PaymentMethod;
  createSession(input: {
    paymentId: string;
    amount: string;
    currency: string;
    callbackUrl: string;
  }): Promise<PaymentSession>;
  verify(transactionId: string): Promise<PaymentVerification>;
}
