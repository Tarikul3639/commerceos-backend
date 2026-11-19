import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CustomerRefreshToken,
  Prisma,
  CustomerStatus,
} from '@/lib/prisma/client';

import { comparePassword, hashPassword } from '@/common/utils/password.util';

@Injectable()
export class CustomerRefreshTokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Save a new refresh token for a customer.
   *
   * Multiple active sessions are allowed.
   * Each browser/device can have its own refresh token.
   */
  async save(
    customerId: string,
    refreshToken: string,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string,
    expectedPasswordHash?: string,
  ): Promise<void> {
    const tokenHash = await hashPassword(
      refreshToken,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    await this.prismaService.$transaction(
      async (tx) => {
        const customer = await tx.customer.findFirst({
          where: {
            id: customerId,
            status: CustomerStatus.ACTIVE,
            deletedAt: null,
            ...(expectedPasswordHash && { password: expectedPasswordHash }),
          },
          select: { id: true },
        });

        if (!customer) {
          throw new UnauthorizedException('Customer account is not active.');
        }

        await tx.customerRefreshToken.create({
          data: {
            customerId,
            tokenHash,
            expiresAt,
            ...(userAgent ? { userAgent } : {}),
            ...(ipAddress ? { ipAddress } : {}),
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Validate a refresh token and return
   * the matching database session.
   */
  async validate(
    customerId: string,
    refreshToken: string,
  ): Promise<CustomerRefreshToken> {
    const tokens = await this.prismaService.customerRefreshToken.findMany({
      where: {
        customerId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const token of tokens) {
      const isMatch = await comparePassword(refreshToken, token.tokenHash);

      if (!isMatch) {
        continue;
      }

      await this.prismaService.customerRefreshToken.update({
        where: {
          id: token.id,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });

      return token;
    }

    throw new UnauthorizedException('Invalid refresh token.');
  }

  /**
   * Atomically consume a customer refresh token so it cannot be replayed by concurrent requests.
   */
  async consume(
    customerId: string,
    refreshToken: string,
  ): Promise<CustomerRefreshToken> {
    const now = new Date();
    const tokens = await this.prismaService.customerRefreshToken.findMany({
      where: {
        customerId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });

    for (const token of tokens) {
      const isMatch = await comparePassword(refreshToken, token.tokenHash);

      if (!isMatch) {
        continue;
      }

      const consumed = await this.prismaService.customerRefreshToken.updateMany(
        {
          where: {
            id: token.id,
            customerId,
            revokedAt: null,
            expiresAt: { gt: now },
          },
          data: {
            revokedAt: now,
            lastUsedAt: now,
          },
        },
      );

      if (consumed.count === 0) {
        throw new UnauthorizedException('Refresh token has already been used.');
      }

      return token;
    }

    throw new UnauthorizedException('Invalid refresh token.');
  }

  /**
   * Revoke a specific session.
   * @param tokenId The ID of the refresh token to revoke.
   */
  async revoke(tokenId: string): Promise<void> {
    await this.prismaService.customerRefreshToken.update({
      where: {
        id: tokenId,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all active sessions
   * for a specific user.
   */
  async revokeAll(customerId: string): Promise<void> {
    await this.prismaService.customerRefreshToken.updateMany({
      where: {
        customerId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Remove expired refresh tokens.
   */
  async removeExpiredTokens(): Promise<void> {
    await this.prismaService.customerRefreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
