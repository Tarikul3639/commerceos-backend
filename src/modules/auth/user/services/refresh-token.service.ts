import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserRefreshToken } from '../../../../lib/prisma/client';

import {
    comparePassword,
    hashPassword,
} from '../../../../common/utils/password.util';

@Injectable()
export class RefreshTokenService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) { }

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
    ): Promise<void> {
        const tokenHash = await hashPassword(
            refreshToken,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        await this.prismaService.userRefreshToken.create({
            data: {
                tokenHash,
                expiresAt,
                userId,

                ...(userAgent ? { userAgent } : {}),
                ...(ipAddress ? { ipAddress } : {}),
            },
        });
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
            const isMatch = await comparePassword(
                refreshToken,
                token.tokenHash,
            );

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
     * Revoke a specific session.
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
