import { vi } from 'vitest';

vi.mock('../../../infrastructure/database/generated/prisma/client.js', () => ({
  Prisma: { TransactionIsolationLevel: { Serializable: 'Serializable' } },
}));
vi.mock('../../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import {
  PaymentProvider,
  PaymentStatus,
  PaymentType,
} from '../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import Stripe from 'stripe';
import { HandleStripeWebhookService } from './handle-stripe-webhook.service.js';

describe('HandleStripeWebhookService', () => {
  const createFixture = (
    status: PaymentStatus = PaymentStatus.PENDING,
    amountTotal = 10000,
  ) => {
    const payment = {
      id: 'payment-1',
      orderId: 'order-1',
      provider: PaymentProvider.STRIPE,
      type: PaymentType.PAYMENT,
      status,
      sessionId: 'cs_test_123',
      amount: { toString: () => '100.00' },
      currency: 'BDT',
    };
    const tx = {
      payment: {
        findUnique: vi.fn().mockResolvedValue({
          ...payment,
          order: { id: 'order-1', status: 'PENDING' },
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 'payment-1' })
          .mockResolvedValueOnce(null),
      },
      order: { update: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transaction: never) => unknown) =>
        callback(tx as never),
      ),
    };
    const service = new HandleStripeWebhookService(
      prisma as unknown as PrismaService,
    );
    const event = {
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          mode: 'payment',
          client_reference_id: 'payment-1',
          metadata: { paymentId: 'payment-1', orderId: 'order-1' },
          amount_total: amountTotal,
          currency: 'bdt',
          payment_status: 'paid',
          payment_intent: 'pi_test_123',
        },
      },
    } as unknown as Stripe.Event;

    return { service, tx, event };
  };

  it('marks a verified paid Checkout Session as paid and updates its order', async () => {
    const { service, tx, event } = createFixture();

    await service.execute(event);

    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: expect.objectContaining({
          id: 'payment-1',
          status: PaymentStatus.PENDING,
          sessionId: 'cs_test_123',
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          status: PaymentStatus.PAID,
          transactionId: 'pi_test_123',
        }),
      }),
    );
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  });

  it('ignores an amount mismatch', async () => {
    const { service, tx, event } = createFixture(PaymentStatus.PENDING, 9999);

    await service.execute(event);

    expect(tx.payment.updateMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });

  it('does not apply a duplicate event to an already settled payment', async () => {
    const { service, tx, event } = createFixture(PaymentStatus.PAID);

    await service.execute(event);

    expect(tx.payment.updateMany).not.toHaveBeenCalled();
    expect(tx.order.update).not.toHaveBeenCalled();
  });
});
