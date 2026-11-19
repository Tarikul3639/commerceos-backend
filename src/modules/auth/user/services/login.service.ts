import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { UserStatus } from '../../../../infrastructure/database/generated/prisma/client.js';

import { comparePassword } from '../../../../common/utils/password.util.js';
import { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface.js';

import { LoginDto } from '../dto/requests/login.dto.js';
import { AuthTokensPayload } from '../interfaces/auth-tokens.interface.js';

import { TokenService } from './token.service.js';
import { RefreshTokenService } from './refresh-token.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly createActivityLog: CreateActivityLogService,
  ) {}

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
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const security = await this.prismaService.securitySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account temporarily locked. Try again after ${user.lockedUntil.toISOString()}.`,
      );
    }

    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      const failed = await this.prismaService.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
        select: { failedLoginAttempts: true },
      });

      if (failed.failedLoginAttempts >= security.maximumFailedLoginAttempts) {
        const lockedUntil = new Date(
          Date.now() + security.accountLockoutDurationMinutes * 60 * 1000,
        );
        await this.prismaService.user.update({
          where: { id: user.id },
          data: { lockedUntil },
        });
        throw new UnauthorizedException(
          `Too many failed attempts. Account locked until ${lockedUntil.toISOString()}.`,
        );
      }

      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

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
      user.password,
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

    // Audit log
    await this.createActivityLog.execute({
      type: ActivityType.LOGIN,
      module: ActivityModule.AUTH,
      action: 'LOGIN',
      description: `User ${user.email} logged in`,
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    });

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
