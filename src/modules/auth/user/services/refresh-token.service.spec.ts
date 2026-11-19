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
  }),
);
vi.mock('../../../../common/utils/password.util.js', () => ({
  comparePassword: vi.fn().mockResolvedValue(true),
  hashPassword: vi.fn(),
}));

import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
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

  it('lists active sessions without exposing refresh token hashes', async () => {
    const token = {
      id: 'session-1',
      tokenHash: 'hashed-refresh-token',
      userAgent: 'Test Browser',
      ipAddress: '127.0.0.1',
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    };
    const prisma = {
      userRefreshToken: {
        findMany: vi.fn().mockResolvedValue([token]),
      },
    };
    const service = new RefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
      {} as never,
    );

    await expect(
      service.listActiveSessions('user-1', 'plain-refresh-token'),
    ).resolves.toEqual([
      {
        id: 'session-1',
        userAgent: 'Test Browser',
        ipAddress: '127.0.0.1',
        createdAt: token.createdAt,
        lastUsedAt: token.lastUsedAt,
        expiresAt: token.expiresAt,
        isCurrent: true,
      },
    ]);
  });

  it('revokes every other active session while preserving the current session', async () => {
    const prisma = {
      userRefreshToken: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'current-session', tokenHash: 'current-hash' },
          { id: 'other-session', tokenHash: 'other-hash' },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new RefreshTokenService(
      prisma as unknown as PrismaService,
      {} as never,
      {} as never,
    );

    await expect(
      service.revokeOtherSessions('user-1', 'plain-refresh-token'),
    ).resolves.toBe(1);

    expect(prisma.userRefreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          id: { not: 'current-session' },
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
