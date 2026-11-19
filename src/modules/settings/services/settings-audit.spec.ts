import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/enums.js';
import { UpdateSettingsService } from './update-settings.service.js';
import { PaymentGatewayService } from './payment-gateway.service.js';
import { ShippingSettingsService } from './shipping-settings.service.js';
import { NotificationPreferencesService } from './notification-preferences.service.js';
import { SecuritySettingsService } from './security-settings.service.js';
import { CreateSizeGuideService } from '../../size-guides/services/create-size-guide.service.js';
import { DeleteSizeGuideService } from '../../size-guides/services/delete-size-guide.service.js';

function setup(tx: Record<string, unknown>) {
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

describe('Admin settings and size-guide audit transactions', () => {
  it('writes General Settings and actor audit data in the same transaction', async () => {
    const previous = { id: 'settings-1', companyName: 'Old store' };
    const saved = {
      id: 'settings-1',
      companyName: 'New store',
      companyEmail: 'new@example.com',
      companyPhone: '',
      companyAddress: '',
      logo: null,
      favicon: null,
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      settings: {
        findFirst: vi.fn().mockResolvedValue(previous),
        update: vi.fn().mockResolvedValue(saved),
      },
    };
    const deps = setup(tx);
    const service = new UpdateSettingsService(deps.prisma, deps.activityLog);

    await service.execute({ companyName: 'New store' }, 'actor-1');

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ActivityType.UPDATE,
        module: ActivityModule.SETTINGS,
        userId: 'actor-1',
        oldValue: previous,
        newValue: saved,
      }),
      tx,
    );
  });

  it('keeps gateway audit metadata free of provider settings and secrets', async () => {
    const created = {
      id: 'gateway-1',
      provider: 'BKASH',
      displayName: 'bKash',
      isEnabled: false,
      mode: 'TEST',
      settings: { publicKey: 'public-value' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      paymentGateway: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };
    const deps = setup(tx);
    const service = new PaymentGatewayService(deps.prisma, deps.activityLog);

    await service.create(
      {
        provider: 'BKASH',
        displayName: 'bKash',
        settings: { publicKey: 'public-value' },
      },
      'actor-2',
    );

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'actor-2',
        newValue: {
          provider: 'BKASH',
          displayName: 'bKash',
          isEnabled: false,
          mode: 'TEST',
        },
      }),
      tx,
    );
  });

  it('normalizes shipping zone names and audits the actor transactionally', async () => {
    const created = {
      id: 'zone-1',
      districtCity: 'New Town',
      districtCityKey: 'new town',
      rate: { toString: () => '75' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      shippingZone: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };
    const deps = setup(tx);
    const service = new ShippingSettingsService(deps.prisma, deps.activityLog);

    await service.createZone(
      { districtCity: '  New   Town  ', rate: 75 },
      'actor-3',
    );

    expect(tx.shippingZone.create).toHaveBeenCalledWith({
      data: {
        districtCity: 'New Town',
        districtCityKey: 'new town',
        rate: 75,
        isActive: true,
      },
    });
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_SHIPPING_ZONE',
        userId: 'actor-3',
      }),
      tx,
    );
  });

  it('audits notification preference updates in the same transaction', async () => {
    const previous = { id: 'default', emailOrders: false };
    const saved = { id: 'default', emailOrders: true };
    const tx = {
      notificationPreferences: {
        findUnique: vi.fn().mockResolvedValue(previous),
        upsert: vi.fn().mockResolvedValue(saved),
      },
    };
    const deps = setup(tx);
    const service = new NotificationPreferencesService(
      deps.prisma,
      deps.activityLog,
    );

    await service.update({ emailOrders: true }, 'actor-4');

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE_NOTIFICATION_PREFERENCES',
        userId: 'actor-4',
        oldValue: previous,
        newValue: saved,
      }),
      tx,
    );
  });

  it('audits security policy changes atomically', async () => {
    const previous = {
      id: 'default',
      refreshTokenLifetimeDays: 7,
      rememberMeRefreshLifetimeDays: 30,
    };
    const saved = { ...previous, minimumPasswordLength: 14 };
    const tx = {
      securitySettings: {
        upsert: vi.fn().mockResolvedValue(previous),
        update: vi.fn().mockResolvedValue(saved),
      },
    };
    const deps = setup(tx);
    const service = new SecuritySettingsService(deps.prisma, deps.activityLog);

    await service.update({ minimumPasswordLength: 14 }, 'actor-5');

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE_SECURITY_SETTINGS',
        userId: 'actor-5',
        oldValue: previous,
        newValue: saved,
      }),
      tx,
    );
  });

  it('creates a size guide and its audit record in one transaction', async () => {
    const created = {
      id: 'guide-1',
      name: 'Footwear',
      description: null,
      unit: 'CM',
      columns: [],
      rows: [],
    };
    const tx = {
      sizeGuide: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };
    const deps = setup(tx);
    const service = new CreateSizeGuideService(deps.prisma, deps.activityLog);

    await service.execute(
      { name: 'Footwear', unit: 'CM', columns: [], rows: [] },
      'actor-6',
    );

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_SIZE_GUIDE',
        userId: 'actor-6',
        entityId: 'guide-1',
      }),
      tx,
    );
  });

  it('deletes an unused size guide and audits it transactionally', async () => {
    const guide = {
      id: 'guide-2',
      name: 'Accessories',
      description: null,
      unit: 'CM',
      columns: [],
      rows: [],
      _count: { products: 0 },
    };
    const tx = {
      sizeGuide: {
        findUnique: vi.fn().mockResolvedValue(guide),
        delete: vi.fn().mockResolvedValue(guide),
      },
    };
    const deps = setup(tx);
    const service = new DeleteSizeGuideService(deps.prisma, deps.activityLog);

    await service.execute('guide-2', 'actor-7');

    expect(deps.transaction).toHaveBeenCalledOnce();
    expect(deps.executeLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'DELETE_SIZE_GUIDE',
        userId: 'actor-7',
        entityId: 'guide-2',
      }),
      tx,
    );
  });
});
