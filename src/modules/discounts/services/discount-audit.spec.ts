import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
  Prisma,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { DiscountService } from './discount.service.js';

function dependencies(tx: Record<string, unknown>) {
  const prisma = {
    $transaction: vi.fn((callback: (client: unknown) => unknown) =>
      callback(tx),
    ),
  };
  const activityLog = { execute: vi.fn().mockResolvedValue(undefined) };
  return {
    prisma: prisma as unknown as PrismaService,
    activityLog: activityLog as unknown as CreateActivityLogService,
    transaction: prisma.$transaction,
    executeLog: activityLog.execute,
  };
}

const discount = (overrides: Record<string, unknown> = {}) => ({
  id: 'discount-1',
  code: 'SAVE20',
  description: null,
  type: 'FIXED',
  value: new Prisma.Decimal(20),
  minOrderAmount: new Prisma.Decimal(50),
  maxDiscountAmount: null,
  startsAt: null,
  endsAt: null,
  usageLimit: 10,
  isActive: true,
  createdById: 'actor-1',
  updatedById: 'actor-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('DiscountService audit transactions', () => {
  it('creates a discount and actor audit entry atomically', async () => {
    const created = discount();
    const tx = {
      discount: {
        create: vi.fn().mockResolvedValue(created),
      },
    };
    const deps = dependencies(tx);
    const service = new DiscountService(deps.prisma, deps.activityLog);

    await service.create('actor-1', {
      code: 'SAVE20',
      type: 'FIXED',
      value: 20,
      minOrderAmount: 50,
      usageLimit: 10,
      isActive: true,
    });

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ActivityType.CREATE,
        module: ActivityModule.DISCOUNT,
        action: 'CREATE_DISCOUNT',
        userId: 'actor-1',
        entityId: created.id,
      }),
      tx,
    );
  });

  it('updates a discount with before/after actor audit data atomically', async () => {
    const previous = discount();
    const updated = discount({ isActive: false });
    const tx = {
      discount: {
        findUnique: vi.fn().mockResolvedValue(previous),
        update: vi.fn().mockResolvedValue(updated),
      },
    };
    const deps = dependencies(tx);
    const service = new DiscountService(deps.prisma, deps.activityLog);

    await service.update('discount-1', 'actor-2', { isActive: false });

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ActivityType.UPDATE,
        module: ActivityModule.DISCOUNT,
        action: 'UPDATE_DISCOUNT',
        userId: 'actor-2',
        oldValue: {
          code: 'SAVE20',
          description: null,
          type: 'FIXED',
          value: '20',
          minOrderAmount: '50',
          maxDiscountAmount: null,
          startsAt: null,
          endsAt: null,
          usageLimit: 10,
          isActive: true,
        },
        newValue: {
          code: 'SAVE20',
          description: null,
          type: 'FIXED',
          value: '20',
          minOrderAmount: '50',
          maxDiscountAmount: null,
          startsAt: null,
          endsAt: null,
          usageLimit: 10,
          isActive: false,
        },
      }),
      tx,
    );
  });
});
