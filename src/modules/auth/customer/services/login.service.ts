import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CustomerStatus } from '../../../../lib/prisma/enums.js';
import { LoginDto } from '../dto/requests/login.dto.js';

import { comparePassword } from '../../../../common/utils/password.util.js';
import { AuthTokens } from '../interfaces/auth-tokens.interface.js';

import { CustomerTokenService } from './token.service.js';
import { CustomerRefreshTokenService } from './refresh-token.service.js';

@Injectable()
export class CustomerLoginService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: CustomerTokenService,
    private readonly refreshTokenService: CustomerRefreshTokenService,
  ) {}

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

    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact support.',
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
      customer.password,
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }
}
