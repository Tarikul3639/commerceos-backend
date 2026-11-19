import { vi } from 'vitest';
vi.mock('../../../../common/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock(
  '../../../activity-logs/services/create-activity-log.service.js',
  () => ({
    CreateActivityLogService: class CreateActivityLogService {},
  }),
);
vi.mock('../../../../lib/prisma/client.js', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
  },
  ActivityModule: { STOCK_MOVEMENT: 'STOCK_MOVEMENT' },
  ActivityType: { UPDATE: 'UPDATE' },
}));

import { BadRequestException, ConflictException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { AdjustStockService } from './adjust-stock.service.js';

describe('AdjustStockService', () => {
  it('rejects zero-quantity adjustments', async () => {
    const prisma = { $transaction: vi.fn() };
    const activityLog = { execute: vi.fn() };
    const service = new AdjustStockService(
      prisma as unknown as PrismaService,
      activityLog as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute('staff-1', { variantId: 'variant-1', quantity: 0 }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('prevents a decrement that would make stock negative', async () => {
    const tx = {
      productVariant: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'variant-1',
          stock: 2,
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transaction: never) => unknown) =>
        callback(tx as never),
      ),
    };
    const activityLog = { execute: vi.fn() };
    const service = new AdjustStockService(
      prisma as unknown as PrismaService,
      activityLog as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute('staff-1', { variantId: 'variant-1', quantity: -3 }),
    ).rejects.toThrow(BadRequestException);

    expect(tx.productVariant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'variant-1',
          stock: { gte: 3 },
        }) as unknown as Record<string, unknown>,
        data: { stock: { increment: -3 } },
      }),
    );
    expect(activityLog.execute).not.toHaveBeenCalled();
  });

  it('records an atomic stock adjustment with the acting staff member', async () => {
    const tx = {
      productVariant: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'variant-1',
          stock: 5,
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          id: 'variant-1',
          productId: 'product-1',
          stock: 2,
          sku: 'SKU-1',
          updatedAt: new Date('2026-11-19T00:00:00.000Z'),
          product: {
            name: 'Test product',
            images: [{ imageUrl: 'https://example.com/image.jpg' }],
          },
        }),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transaction: never) => unknown) =>
        callback(tx as never),
      ),
    };
    const activityLog = { execute: vi.fn() };
    const service = new AdjustStockService(
      prisma as unknown as PrismaService,
      activityLog as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute('staff-1', {
        variantId: 'variant-1',
        quantity: -3,
        reason: 'Stock count correction',
      }),
    ).resolves.toMatchObject({
      variantId: 'variant-1',
      quantity: 2,
      productId: 'product-1',
    });

    expect(activityLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'staff-1',
        oldValue: { quantity: 5 },
        newValue: {
          quantity: 2,
          adjustment: -3,
          reason: 'Stock count correction',
        },
      }),
    );
  });

  it('translates serializable transaction conflicts into a retryable conflict response', async () => {
    const prisma = {
      $transaction: vi.fn().mockRejectedValue({ code: 'P2034' }),
    };
    const service = new AdjustStockService(
      prisma as unknown as PrismaService,
      { execute: vi.fn() } as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute('staff-1', { variantId: 'variant-1', quantity: 1 }),
    ).rejects.toThrow(ConflictException);
  });
});
