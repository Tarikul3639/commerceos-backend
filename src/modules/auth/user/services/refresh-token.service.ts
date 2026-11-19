import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import {
  Prisma,
  UserRefreshToken,
} from '../../../../infrastructure/database/generated/prisma/client.js';

import {
  comparePassword,
  hashPassword,
} from '../../../../common/utils/password.util.js';

import { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface.js';
import { UserStatus } from '../../../../infrastructure/database/generated/prisma/enums.js';
import { AuthTokensPayload } from '../interfaces/auth-tokens.interface.js';

import { TokenService } from './token.service.js';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Save a new refresh token for a user.
   *
   * Multiple active sessions are allowed.
   * Each browser/device can have its own refresh token.
   */
  async save(
    userId: string,
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
        const user = await tx.user.findFirst({
          where: {
            id: userId,
            status: UserStatus.ACTIVE,
            deletedAt: null,
            isVerified: true,
            ...(expectedPasswordHash && { password: expectedPasswordHash }),
          },
          select: { id: true },
        });

        if (!user) {
          throw new UnauthorizedException(
            'User account is not active or verified.',
          );
        }

        await tx.userRefreshToken.create({
          data: {
            tokenHash,
            expiresAt,
            lastUsedAt: new Date(),
            userId,
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
    userId: string,
    refreshToken: string,
  ): Promise<UserRefreshToken> {
    const tokens = await this.prismaService.userRefreshToken.findMany({
      where: {
        userId,
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

      await this.prismaService.userRefreshToken.update({
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
   * Atomically consume a refresh token so concurrent refresh/logout requests cannot reuse it.
   */
  async consume(
    userId: string,
    refreshToken: string,
  ): Promise<UserRefreshToken> {
    const now = new Date();
    const tokens = await this.prismaService.userRefreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });

    for (const token of tokens) {
      const isMatch = await comparePassword(refreshToken, token.tokenHash);

      if (!isMatch) {
        continue;
      }

      const consumed = await this.prismaService.userRefreshToken.updateMany({
        where: {
          id: token.id,
          userId,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          revokedAt: now,
          lastUsedAt: now,
        },
      });

      if (consumed.count === 0) {
        throw new UnauthorizedException('Refresh token has already been used.');
      }

      return token;
    }

    throw new UnauthorizedException('Invalid refresh token.');
  }

  /**
   * Rotate a refresh token.
   *
   * The old refresh token is revoked and
   * a new access/refresh token pair is generated.
   */
  async rotate(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AuthTokensPayload> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: UserJwtPayload;

    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const user = await this.prismaService.user.findFirst({
      where: {
        id: payload.id,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        isVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User account is not active or verified.',
      );
    }

    const now = new Date();
    const storedTokens = await this.prismaService.userRefreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });

    let matchedToken: UserRefreshToken | null = null;

    for (const storedToken of storedTokens) {
      if (await comparePassword(refreshToken, storedToken.tokenHash)) {
        matchedToken = storedToken;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokens = await this.tokenService.generateAuthTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      payload.remember ?? false,
    );

    const tokenHash = await hashPassword(
      tokens.refreshToken,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    try {
      await this.prismaService.$transaction(
        async (tx) => {
          const activeUser = await tx.user.findFirst({
            where: {
              id: user.id,
              status: UserStatus.ACTIVE,
              deletedAt: null,
              isVerified: true,
            },
            select: { id: true },
          });

          if (!activeUser) {
            throw new UnauthorizedException(
              'User account is not active or verified.',
            );
          }

          const consumed = await tx.userRefreshToken.updateMany({
            where: {
              id: matchedToken.id,
              userId: user.id,
              revokedAt: null,
              expiresAt: { gt: now },
            },
            data: {
              revokedAt: now,
              lastUsedAt: now,
            },
          });

          if (consumed.count === 0) {
            throw new UnauthorizedException(
              'Refresh token has already been used.',
            );
          }

          await tx.userRefreshToken.create({
            data: {
              tokenHash,
              expiresAt: tokens.refreshTokenExpiresAt,
              lastUsedAt: now,
              userId: user.id,
              ...(userAgent ? { userAgent } : {}),
              ...(ipAddress ? { ipAddress } : {}),
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2034'
      ) {
        throw new UnauthorizedException('Refresh token is no longer valid.');
      }

      throw error;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
  }

  /**
   * List non-expired active sessions and identify the current browser session.
   */
  async listActiveSessions(userId: string, refreshToken?: string) {
    const sessions = await this.prismaService.userRefreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        tokenHash: true,
      },
    });

    let currentSessionId: string | null = null;
    if (refreshToken) {
      for (const session of sessions) {
        if (await comparePassword(refreshToken, session.tokenHash)) {
          currentSessionId = session.id;
          break;
        }
      }
    }

    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      isCurrent: session.id === currentSessionId,
    }));
  }

  /** Revoke one active session belonging to the authenticated user. */
  async revokeSession(
    userId: string,
    sessionId: string,
    refreshToken?: string,
  ): Promise<{ isCurrent: boolean }> {
    const session = await this.prismaService.userRefreshToken.findFirst({
      where: { id: sessionId, userId, revokedAt: null },
      select: { id: true, tokenHash: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or already revoked.');
    }

    const isCurrent = refreshToken
      ? await comparePassword(refreshToken, session.tokenHash)
      : false;

    await this.prismaService.userRefreshToken.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { isCurrent };
  }

  /** Revoke every active session except the current browser session. */
  async revokeOtherSessions(
    userId: string,
    refreshToken?: string,
  ): Promise<number> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Current session could not be identified.',
      );
    }

    const sessions = await this.prismaService.userRefreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true, tokenHash: true },
    });

    let currentSessionId: string | null = null;
    for (const session of sessions) {
      if (await comparePassword(refreshToken, session.tokenHash)) {
        currentSessionId = session.id;
        break;
      }
    }

    if (!currentSessionId) {
      throw new UnauthorizedException(
        'Current session could not be identified.',
      );
    }

    const result = await this.prismaService.userRefreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        id: { not: currentSessionId },
      },
      data: { revokedAt: new Date() },
    });

    return result.count;
  }

  /**
   * Revoke a specific session.
   *
   * @param tokenId The ID of the refresh token to revoke.
   */
  async revoke(tokenId: string): Promise<void> {
    await this.prismaService.userRefreshToken.update({
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
  async revokeAll(userId: string): Promise<void> {
    await this.prismaService.userRefreshToken.updateMany({
      where: {
        userId,
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
    await this.prismaService.userRefreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
