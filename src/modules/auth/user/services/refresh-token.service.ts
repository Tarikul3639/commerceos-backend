import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserRefreshToken } from '../../../../lib/prisma/client';

import {
    comparePassword,
    hashPassword,
} from '../../../../common/utils/password.util';

import { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface';
import { AuthTokensPayload } from '../interfaces/auth-tokens.interface';

import { TokenService } from './token.service';

@Injectable()
export class RefreshTokenService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
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

        throw new UnauthorizedException(
            'Invalid refresh token.',
        );
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
            throw new UnauthorizedException(
                'Refresh token is required.',
            );
        }

        let payload: UserJwtPayload;

        try {
            payload =
                await this.tokenService.verifyRefreshToken(
                    refreshToken,
                );
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired refresh token.',
            );
        }

        const storedToken = await this.validate(
            payload.id,
            refreshToken,
        );

        await this.revoke(storedToken.id);

        const tokens =
            await this.tokenService.generateAuthTokens({
                id: payload.id,
                email: payload.email,
                name: payload.name,
                role: payload.role,
            });

        await this.save(
            payload.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            userAgent,
            ipAddress,
        );

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        };
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