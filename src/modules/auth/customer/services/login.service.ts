import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { LoginDto } from '../dto/requests/login.dto';

import { comparePassword } from '../../../../common/utils/password.util';
import { AuthTokens } from '../interfaces/auth-tokens.interface';

import { CustomerTokenService } from './token.service';
import { CustomerRefreshTokenService } from './refresh-token.service';

@Injectable()
export class CustomerLoginService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly tokenService: CustomerTokenService,
        private readonly refreshTokenService: CustomerRefreshTokenService,
    ) { }

    async execute(
        dto: LoginDto,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<AuthTokens> {
        const { email, password } = dto;

        const customer = await this.prismaService.customer.findUnique({
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
            },
        });

        if (!customer) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        const isPasswordValid = await comparePassword(password, customer.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        if (customer.status == 'INACTIVE') {
            throw new UnauthorizedException(
                'Your account is inactive. Please contact support.',
            );
        }

        if (customer.status == 'SUSPENDED') {
            throw new UnauthorizedException(
                'Your account is suspended. Please contact support.',
            );
        }

        const accessToken = await this.tokenService.generateAccessToken({
            id: customer.id,
            email: customer.email,
        });

        const { token: refreshToken, expiresAt: refreshTokenExpiresAt } =
            await this.tokenService.generateRefreshToken({
                id: customer.id,
                email: customer.email,
            });

        await this.refreshTokenService.save(
            customer.id,
            refreshToken,
            refreshTokenExpiresAt,
            userAgent,
            ipAddress,
        );

        return {
            accessToken,
            refreshToken,
            refreshTokenExpiresAt,
        };
    }
}
