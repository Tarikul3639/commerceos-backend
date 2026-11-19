import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestException, ConflictException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';
import { AdjustStockService } from './adjust-stock.service.js';

describe('AdjustStockService', () => {
  let module: TestingModule;
  let service: AdjustStockService;

  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
  };

  let transaction: {
    productVariant: {
      findFirst: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      findUniqueOrThrow: ReturnType<typeof vi.fn>;
    };
  };

  let createActivityLog: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    transaction = {
      productVariant: {
        findFirst: vi.fn(),
        updateMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
    };

    prisma = {
      $transaction: vi.fn((callback: (tx: never) => unknown) =>
        Promise.resolve(callback(transaction as never)),
      ),
    };

    createActivityLog = {
      execute: vi.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      providers: [
        AdjustStockService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: CreateActivityLogService,
          useValue: createActivityLog,
        },
      ],
    }).compile();

    service = module.get(AdjustStockService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('rejects an adjustment when the quantity is zero', async () => {
    await expect(
      service.execute('staff-1', {
        variantId: 'variant-1',
        quantity: 0,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(createActivityLog.execute).not.toHaveBeenCalled();
  });

  it('does not allow a decrement that would make stock negative', async () => {
    transaction.productVariant.findFirst.mockResolvedValue({
      id: 'variant-1',
      stock: 2,
    });
    transaction.productVariant.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.execute('staff-1', {
        variantId: 'variant-1',
        quantity: -3,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(transaction.productVariant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'variant-1',
          stock: { gte: 3 },
        }) as Record<string, unknown>,
        data: {
          stock: { increment: -3 },
        },
      }),
    );
    expect(transaction.productVariant.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(createActivityLog.execute).not.toHaveBeenCalled();
  });

  it('adjusts stock atomically and records the acting staff member', async () => {
    const updatedAt = new Date('2026-11-19T00:00:00.000Z');

    transaction.productVariant.findFirst.mockResolvedValue({
      id: 'variant-1',
      stock: 5,
    });
    transaction.productVariant.updateMany.mockResolvedValue({ count: 1 });
    transaction.productVariant.findUniqueOrThrow.mockResolvedValue({
      id: 'variant-1',
      productId: 'product-1',
      stock: 2,
      sku: 'SKU-1',
      updatedAt,
      product: {
        name: 'Test product',
        images: [{ imageUrl: 'https://example.com/image.jpg' }],
      },
    });

    await expect(
      service.execute('staff-1', {
        variantId: 'variant-1',
        quantity: -3,
        reason: 'Stock count correction',
      }),
    ).resolves.toMatchObject({
      id: 'variant-1',
      variantId: 'variant-1',
      productId: 'product-1',
      quantity: 2,
      sku: 'SKU-1',
      productName: 'Test product',
      productImage: 'https://example.com/image.jpg',
      updatedAt,
    });

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
    expect(createActivityLog.execute).toHaveBeenCalledWith(
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

  it('translates a serializable transaction conflict into a retryable conflict response', async () => {
    prisma.$transaction.mockRejectedValue({ code: 'P2034' });

    await expect(
      service.execute('staff-1', {
        variantId: 'variant-1',
        quantity: 1,
      }),
    ).rejects.toThrow(ConflictException);

    expect(createActivityLog.execute).not.toHaveBeenCalled();
  });
});
