import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserStatus } from '../../../../lib/prisma/client';

import { comparePassword } from '../../../../common/utils/password.util';
import { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface';

import { LoginDto } from '../dto/requests/login.dto';
import { AuthTokensPayload } from '../interfaces/auth-tokens.interface';

import { TokenService } from './token.service';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class LoginService {
    private readonly logger = new Logger(LoginService.name);

    constructor(
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService,
        private readonly refreshTokenService: RefreshTokenService,
    ) { }

    async execute(
        loginDto: LoginDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<AuthTokensPayload> {
        const { email, password, remember = false } = loginDto;

        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },

            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                status: true,
                isVerified: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'This email is not registered. Please contact support team.',
            );
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password. Please try again.');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException(
                'Please verify your email before signing in.',
            );
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('Your account is not active.');
        }

        const jwtPayload = this.createJwtPayload(user);

        const tokens = await this.tokenService.generateAuthTokens(
            jwtPayload,
            remember,
        );

        await this.refreshTokenService.save(
            user.id,
            tokens.refreshToken,
            tokens.refreshTokenExpiresAt,
            userAgent,
            ipAddress,
        );

        await this.prismaService.user.update({
            where: {
                id: user.id,
            },

            data: {
                lastLoginAt: new Date(),
            },
        });

        this.logger.log(`User ${user.email} logged in.`);

        return tokens;
    }

    private createJwtPayload(user: {
        id: string;
        name: string;
        email: string;
        role: UserJwtPayload['role'];
    }): UserJwtPayload {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}
