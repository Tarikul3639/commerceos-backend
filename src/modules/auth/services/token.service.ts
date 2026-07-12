import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms, { type StringValue } from 'ms';

import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async generateAccessToken(payload: JwtPayload): Promise<string> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.accessExpiresIn',
        );

        return this.jwtService.signAsync(payload, {
            secret: this.getAccessSecret(),
            expiresIn,
        });
    }

    async generateRefreshToken(payload: JwtPayload): Promise<{
        token: string;
        expiresAt: Date;
    }> {
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.refreshExpiresIn',
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

    async generateAuthTokens(payload: JwtPayload): Promise<AuthTokens> {
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

    async verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.verifyToken(token, this.getAccessSecret());
    }

    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        return this.verifyToken(token, this.getRefreshSecret());
    }

    private async verifyToken(
        token: string,
        secret: string,
    ): Promise<JwtPayload> {
        return this.jwtService.verifyAsync<JwtPayload>(token, {
            secret,
        });
    }

    private getAccessSecret(): string {
        return this.configService.getOrThrow<string>('auth.accessSecret');
    }

    private getRefreshSecret(): string {
        return this.configService.getOrThrow<string>('auth.refreshSecret');
    }
}
