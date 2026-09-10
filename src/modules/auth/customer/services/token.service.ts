import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { createHash, randomBytes } from 'node:crypto';

import ms, { type StringValue } from 'ms';

import { CustomerJwtPayload } from '../../../../common/interfaces/customer-jwt-payload.interface';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

@Injectable()
export class CustomerTokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateAccessToken(payload: CustomerJwtPayload): Promise<string> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.customer.accessExpiresIn',
        );

        return this.jwtService.signAsync(payload, {
            secret: this.getAccessSecret(),
            expiresIn,
        });
    }

    async generateRefreshToken(payload: CustomerJwtPayload): Promise<{
        token: string;
        expiresAt: Date;
    }> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.customer.refreshExpiresIn',
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

    async generateAuthTokens(payload: CustomerJwtPayload): Promise<AuthTokens> {
        const [accessToken, refresh] = await Promise.all([
            this.generateAccessToken(payload),
            this.generateRefreshToken(payload),
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

    async verifyAccessToken(token: string): Promise<CustomerJwtPayload> {
        return this.verifyToken(token, this.getAccessSecret());
    }

    async verifyRefreshToken(token: string): Promise<CustomerJwtPayload> {
        return this.verifyToken(token, this.getRefreshSecret());
    }

    private async verifyToken(
        token: string,
        secret: string,
    ): Promise<CustomerJwtPayload> {
        return this.jwtService.verifyAsync<CustomerJwtPayload>(token, {
            secret,
        });
    }

    private getAccessSecret(): string {
        return this.configService.getOrThrow<string>('auth.customer.accessSecret');
    }

    private getRefreshSecret(): string {
        return this.configService.getOrThrow<string>('auth.customer.refreshSecret');
    }
}
