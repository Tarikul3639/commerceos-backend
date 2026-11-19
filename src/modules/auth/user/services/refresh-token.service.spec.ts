import { vi } from 'vitest';
vi.mock('../../../../common/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock('../../../../lib/prisma/client.js', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
  },
}));
vi.mock('../../../../common/utils/password.util.js', () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
  hashPassword: vi.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { RefreshTokenService } from './refresh-token.service.js';

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
        findMany: vi.fn().mockResolvedValue([token]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
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
        }) as unknown as Record<string, unknown>,
      }),
    );
  });

  it('rejects a refresh token already consumed by another request', async () => {
    const prisma = {
      userRefreshToken: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'session-1',
            tokenHash: 'hashed-refresh-token',
          },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
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
