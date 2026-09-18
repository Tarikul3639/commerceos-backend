import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { createHash, randomBytes } from 'node:crypto';

import ms, { type StringValue } from 'ms';

import { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateAccessToken(payload: UserJwtPayload): Promise<string> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.user.accessExpiresIn',
        );

        return this.jwtService.signAsync(payload, {
            secret: this.getAccessSecret(),
            expiresIn,
        });
    }

    async generateRefreshToken(
        payload: UserJwtPayload,
        remember = false,
    ): Promise<{
        token: string;
        expiresAt: Date;
    }> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            remember
                ? 'auth.user.rememberRefreshExpiresIn'
                : 'auth.user.refreshExpiresIn',
        );

        const token = await this.jwtService.signAsync(payload, {
            secret: this.getRefreshSecret(),
            expiresIn,
        });

        return {
            token,
            expiresAt: new Date(Date.now() + ms(expiresIn)),
        };
    }

    async generateAuthTokens(payload: UserJwtPayload, remember = false): Promise<AuthTokens> {
        const [accessToken, refresh] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload, remember),
        ]);

        return {
            accessToken,
            refreshToken: refresh.token,
            refreshTokenExpiresAt: refresh.expiresAt,
        };
    }

    generateRandomToken(): string {
        return randomBytes(32).toString('hex');
    }

    hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    async verifyAccessToken(token: string): Promise<UserJwtPayload> {
        return this.verifyToken(token, this.getAccessSecret());
    }

    async verifyRefreshToken(token: string): Promise<UserJwtPayload> {
        return this.verifyToken(token, this.getRefreshSecret());
    }

    private async verifyToken(
        token: string,
        secret: string,
    ): Promise<UserJwtPayload> {
        return this.jwtService.verifyAsync<UserJwtPayload>(token, {
            secret,
        });
    }

    private getAccessSecret(): string {
        return this.configService.getOrThrow<string>('auth.user.accessSecret');
    }

    private getRefreshSecret(): string {
        return this.configService.getOrThrow<string>('auth.user.refreshSecret');
    }
}
