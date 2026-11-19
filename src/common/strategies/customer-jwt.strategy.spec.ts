jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CustomerStatus } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CustomerJwtStrategy } from './customer-jwt.strategy';

describe('CustomerJwtStrategy', () => {
  let prisma: { customer: { findUnique: jest.Mock } };
  let strategy: CustomerJwtStrategy;

  beforeEach(() => {
    prisma = {
      customer: {
        findUnique: jest.fn(),
      },
    };
    strategy = new CustomerJwtStrategy(
      { getOrThrow: jest.fn(() => 'test-secret') } as unknown as ConfigService,
      prisma as unknown as PrismaService,
    );
  });

  it('returns current database identity for an active customer', async () => {
    prisma.customer.findUnique.mockResolvedValue({
      id: 'customer-1',
      email: 'current@example.com',
      status: CustomerStatus.ACTIVE,
      deletedAt: null,
    });

    await expect(
      strategy.validate({
        id: 'customer-1',
        email: 'stale@example.com',
      }),
    ).resolves.toEqual({
      id: 'customer-1',
      email: 'current@example.com',
    });
  });

  it('rejects a suspended customer account', async () => {
    prisma.customer.findUnique.mockResolvedValue({
      id: 'customer-1',
      email: 'customer@example.com',
      status: CustomerStatus.SUSPENDED,
      deletedAt: null,
    });

    await expect(
      strategy.validate({
        id: 'customer-1',
        email: 'customer@example.com',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
