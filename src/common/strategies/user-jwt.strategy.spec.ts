jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserStatus, Role } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserJwtStrategy } from './user-jwt.strategy';

describe('UserJwtStrategy', () => {
  let prisma: { user: { findUnique: jest.Mock } };
  let strategy: UserJwtStrategy;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };
    strategy = new UserJwtStrategy(
      { getOrThrow: jest.fn(() => 'test-secret') } as unknown as ConfigService,
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
