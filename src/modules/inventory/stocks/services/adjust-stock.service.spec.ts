jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock(
  '@/modules/activity-logs/services/create-activity-log.service',
  () => ({
    CreateActivityLogService: class CreateActivityLogService {},
  }),
);
jest.mock('@/lib/prisma/client', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
  },
  ActivityModule: { STOCK_MOVEMENT: 'STOCK_MOVEMENT' },
  ActivityType: { UPDATE: 'UPDATE' },
}));

import { BadRequestException, ConflictException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { AdjustStockService } from './adjust-stock.service';

describe('AdjustStockService', () => {
  it('rejects zero-quantity adjustments', async () => {
    const prisma = { $transaction: jest.fn() };
    const activityLog = { execute: jest.fn() };
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
        findFirst: jest.fn().mockResolvedValue({
          id: 'variant-1',
          stock: 2,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const activityLog = { execute: jest.fn() };
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
        }),
        data: { stock: { increment: -3 } },
      }),
    );
    expect(activityLog.execute).not.toHaveBeenCalled();
  });

  it('records an atomic stock adjustment with the acting staff member', async () => {
    const tx = {
      productVariant: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'variant-1',
          stock: 5,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
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
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const activityLog = { execute: jest.fn() };
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
      $transaction: jest.fn().mockRejectedValue({ code: 'P2034' }),
    };
    const service = new AdjustStockService(
      prisma as unknown as PrismaService,
      { execute: jest.fn() } as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute('staff-1', { variantId: 'variant-1', quantity: 1 }),
    ).rejects.toThrow(ConflictException);
  });
});
