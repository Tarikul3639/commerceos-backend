import { vi } from 'vitest';
vi.mock('../prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserStatus, Role } from '../../lib/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserJwtStrategy } from './user-jwt.strategy.js';

describe('UserJwtStrategy', () => {
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };
  let strategy: UserJwtStrategy;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
    };
    strategy = new UserJwtStrategy(
      { getOrThrow: vi.fn(() => 'test-secret') } as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );
  });

  it('returns current database identity and role for an active staff account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'current@example.com',
      name: 'Current Name',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      deletedAt: null,
    });

    await expect(
      strategy.validate({
        id: 'user-1',
        email: 'stale@example.com',
        name: 'Stale Name',
        role: Role.EMPLOYEE,
      }),
    ).resolves.toEqual({
      id: 'user-1',
      email: 'current@example.com',
      name: 'Current Name',
      role: Role.ADMIN,
      remember: undefined,
    });
  });

  it('rejects a disabled staff account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'staff@example.com',
      name: 'Staff',
      role: Role.ADMIN,
      status: UserStatus.SUSPENDED,
      deletedAt: null,
    });

    await expect(
      strategy.validate({
        id: 'user-1',
        email: 'staff@example.com',
        name: 'Staff',
        role: Role.ADMIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
