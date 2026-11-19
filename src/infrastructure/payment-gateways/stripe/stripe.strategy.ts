import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '../../database/generated/prisma/enums.js';
import {
  CheckoutSessionResult,
  CreateCheckoutSessionInput,
  PaymentStrategy,
} from '../../../modules/payments/strategies/payment-strategy.interface.js';
import { StripeClient } from './stripe.client.js';
import { toStripeMinorUnits } from './stripe.mapper.js';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
  readonly provider = PaymentProvider.STRIPE;

  constructor(private readonly stripeClient: StripeClient) {}

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const session = await this.stripeClient
      .getClient()
      .checkout.sessions.create(
        {
          mode: 'payment',
          line_items: input.lineItems.map((item) => ({
            quantity: item.quantity,
            price_data: {
              currency: input.currency.toLowerCase(),
              unit_amount: toStripeMinorUnits(item.unitPrice),
              product_data: {
                name: item.name,
                ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
              },
            },
          })),
          client_reference_id: input.paymentId,
          metadata: {
            paymentId: input.paymentId,
            orderId: input.orderId,
            invoiceNo: input.invoiceNo,
          },
          payment_intent_data: {
            metadata: {
              paymentId: input.paymentId,
              orderId: input.orderId,
              invoiceNo: input.invoiceNo,
            },
          },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
        { idempotencyKey: input.idempotencyKey },
      );

    if (!session.url) {
      throw new Error('Stripe did not return a Checkout URL.');
    }

    return { sessionId: session.id, checkoutUrl: session.url };
  }

  async retrieveCheckoutSession(sessionId: string): Promise<string | null> {
    const session = await this.stripeClient
      .getClient()
      .checkout.sessions.retrieve(sessionId);

    return session.url;
  }
}
