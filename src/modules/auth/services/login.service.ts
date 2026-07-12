import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserStatus } from '../../../lib/prisma/client';

import { comparePassword } from '../../../common/utils/password.util';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

import { LoginDto } from '../dto/requests/login.dto';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

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
        userAgent?: string,
        ipAddress?: string,
    ): Promise<AuthTokens> {
        const { email, password } = loginDto;

        const user = await this.prismaService.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                status: true,
                isVerified: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException(
                'Please verify your email before signing in.',
            );
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('Your account is not active.');
        }

        const tokens = await this.tokenService.generateAuthTokens(
            this.createJwtPayload(user),
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
        email: string;
        role: {
            name: JwtPayload['role'];
        };
    }): JwtPayload {
        return {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        };
    }
}
