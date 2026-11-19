import { vi } from 'vitest';
vi.mock('../../../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock(
  '../../../../infrastructure/database/generated/prisma/client.js',
  () => ({
    Prisma: {
      TransactionIsolationLevel: { Serializable: 'Serializable' },
    },
    CustomerStatus: { ACTIVE: 'ACTIVE' },
  }),
);
vi.mock('../../../../common/utils/password.util.js', () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
  hashPassword: vi.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CustomerRefreshTokenService } from './refresh-token.service.js';

describe('CustomerRefreshTokenService.consume', () => {
  it('uses the refresh token as the plaintext password and atomically revokes the session', async () => {
    const token = {
      id: 'customer-session-1',
      tokenHash: 'hashed-refresh-token',
      customerId: 'customer-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };
    const prisma = {
      customerRefreshToken: {
        findMany: vi.fn().mockResolvedValue([token]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new CustomerRefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
    );

    await expect(
      service.consume('customer-1', 'plain-refresh-token'),
    ).resolves.toEqual(token);

    expect(prisma.customerRefreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'customer-session-1',
          customerId: 'customer-1',
          revokedAt: null,
        }) as unknown as Record<string, unknown>,
      }),
    );
  });

  it('rejects a customer refresh token that was already consumed', async () => {
    const prisma = {
      customerRefreshToken: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'customer-session-1',
            tokenHash: 'hashed-refresh-token',
          },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new CustomerRefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
    );

    await expect(
      service.consume('customer-1', 'plain-refresh-token'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
