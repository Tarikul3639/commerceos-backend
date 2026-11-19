jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('@/lib/prisma/client', () => ({
  Prisma: { TransactionIsolationLevel: { Serializable: 'Serializable' } },
  ActivityModule: { PAYMENT: 'PAYMENT' },
  ActivityType: { STATUS_CHANGE: 'STATUS_CHANGE' },
  PaymentStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
    CANCELLED: 'CANCELLED',
  },
  PaymentType: {
    PAYMENT: 'PAYMENT',
    REFUND: 'REFUND',
  },
}));

import { BadRequestException } from '@nestjs/common';

import { PaymentMethod, PaymentStatus } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdatePaymentStatusService } from './update-payment-status.service';
import { UpdatePaymentStatusDto } from '../dto/requests/update-payment-status.dto';

describe('UpdatePaymentStatusService', () => {
  const createService = (payment: Record<string, unknown>) => {
    const updatedPayment = {
      ...payment,
      status: PaymentStatus.PAID,
      amount: { toString: () => '100.00' },
    };
    const tx = {
      payment: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(payment)
          .mockResolvedValueOnce(updatedPayment),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      order: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };

    return {
      service: new UpdatePaymentStatusService(
        prisma as unknown as PrismaService,
        { execute: jest.fn() } as never,
      ),
      tx,
    };
  };

  it('does not allow manual settlement of gateway payments', async () => {
    const { service, tx } = createService({
      id: 'payment-1',
      orderId: 'order-1',
      type: 'PAYMENT',
      status: 'PENDING',
      method: PaymentMethod.BKASH,
      transactionId: null,
      notes: null,
      order: { status: 'PENDING', paymentStatus: 'PENDING' },
    });

    await expect(
      service.execute(
        'payment-1',
        {
          status: PaymentStatus.PAID,
          transactionId: 'unverified-reference',
        } as UpdatePaymentStatusDto,
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });

  it('allows manual settlement for a cash payment', async () => {
    const { service, tx } = createService({
      id: 'payment-1',
      orderId: 'order-1',
      type: 'PAYMENT',
      status: 'PENDING',
      method: PaymentMethod.CASH,
      transactionId: null,
      notes: null,
      order: { status: 'PENDING', paymentStatus: 'PENDING' },
    });

    await expect(
      service.execute(
        'payment-1',
        { status: PaymentStatus.PAID } as UpdatePaymentStatusDto,
        'admin-1',
      ),
    ).resolves.toMatchObject({ status: PaymentStatus.PAID });

    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'payment-1',
          type: 'PAYMENT',
          status: 'PENDING',
        },
      }),
    );
  });

  it('does not allow marking a payment as refunded without a refund settlement flow', async () => {
    const { service, tx } = createService({
      id: 'payment-1',
      orderId: 'order-1',
      type: 'PAYMENT',
      status: 'PENDING',
      method: PaymentMethod.CASH,
      transactionId: null,
      notes: null,
      order: { status: 'PENDING', paymentStatus: 'PENDING' },
    });

    await expect(
      service.execute(
        'payment-1',
        { status: PaymentStatus.REFUNDED } as UpdatePaymentStatusDto,
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a second paid payment transaction for the same order', async () => {
    const { service, tx } = createService({
      id: 'payment-2',
      orderId: 'order-1',
      type: 'PAYMENT',
      status: 'PENDING',
      method: PaymentMethod.CASH,
      transactionId: null,
      notes: null,
      order: { status: 'PENDING', paymentStatus: 'PAID' },
    });
    tx.payment.findFirst.mockResolvedValueOnce({ id: 'payment-1' });

    await expect(
      service.execute(
        'payment-2',
        { status: PaymentStatus.PAID } as UpdatePaymentStatusDto,
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });

  it('keeps the order paid when another payment transaction is already paid', async () => {
    const { service, tx } = createService({
      id: 'payment-2',
      orderId: 'order-1',
      type: 'PAYMENT',
      status: 'PENDING',
      method: PaymentMethod.CASH,
      transactionId: null,
      notes: null,
      order: { status: 'PENDING', paymentStatus: 'PAID' },
    });
    tx.payment.findFirst.mockResolvedValueOnce({ id: 'payment-1' });

    await service.execute(
      'payment-2',
      { status: PaymentStatus.FAILED } as UpdatePaymentStatusDto,
      'admin-1',
    );

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  });
});
