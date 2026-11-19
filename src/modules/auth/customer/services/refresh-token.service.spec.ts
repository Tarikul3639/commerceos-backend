jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('@/lib/prisma/client', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
  },
  CustomerStatus: { ACTIVE: 'ACTIVE' },
}));
jest.mock('@/common/utils/password.util', () => ({
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CustomerRefreshTokenService } from './refresh-token.service';

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
        findMany: jest.fn().mockResolvedValue([token]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
        }),
      }),
    );
  });

  it('rejects a customer refresh token that was already consumed', async () => {
    const prisma = {
      customerRefreshToken: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'customer-session-1',
            tokenHash: 'hashed-refresh-token',
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
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
