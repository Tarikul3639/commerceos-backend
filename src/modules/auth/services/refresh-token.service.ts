import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { RefreshToken } from '../../../lib/prisma/client';

import {
    comparePassword,
    hashPassword,
} from '../../../common/utils/password.util';

@Injectable()
export class RefreshTokenService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
    ) { }

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

        // Revoke all active refresh tokens for this user
        await this.prismaService.refreshToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        const data = {
            tokenHash,
            expiresAt,
            userId,
            ...(userAgent ? { userAgent } : {}),
            ...(ipAddress ? { ipAddress } : {}),
        };

        await this.prismaService.refreshToken.create({
            data,
        });
    }

    async validate(userId: string, refreshToken: string): Promise<RefreshToken> {
        const tokens = await this.prismaService.refreshToken.findMany({
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

            await this.prismaService.refreshToken.update({
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

    async revoke(tokenId: string): Promise<void> {
        await this.prismaService.refreshToken.update({
            where: {
                id: tokenId,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    async revokeAll(userId: string): Promise<void> {
        await this.prismaService.refreshToken.updateMany({
            where: {
                userId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            },
        });
    }

    async removeExpiredTokens(): Promise<void> {
        await this.prismaService.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
}
