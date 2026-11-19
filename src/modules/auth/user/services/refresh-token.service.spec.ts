jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('@/lib/prisma/client', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
  },
}));
jest.mock('@/common/utils/password.util', () => ({
  comparePassword: jest.fn().mockResolvedValue(true),
  hashPassword: jest.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService.consume', () => {
  it('atomically revokes the matching session before it can be reused', async () => {
    const token = {
      id: 'session-1',
      tokenHash: 'hashed-refresh-token',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };
    const prisma = {
      userRefreshToken: {
        findMany: jest.fn().mockResolvedValue([token]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new RefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
      {} as never,
    );

    await expect(
      service.consume('user-1', 'plain-refresh-token'),
    ).resolves.toEqual(token);

    expect(prisma.userRefreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'session-1',
          userId: 'user-1',
          revokedAt: null,
        }),
      }),
    );
  });

  it('rejects a refresh token already consumed by another request', async () => {
    const prisma = {
      userRefreshToken: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'session-1',
            tokenHash: 'hashed-refresh-token',
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new RefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
      {} as never,
    );

    await expect(
      service.consume('user-1', 'plain-refresh-token'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
