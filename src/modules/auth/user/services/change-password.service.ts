import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

import {
  comparePassword,
  hashPassword,
} from '../../../../common/utils/password.util.js';

import { RefreshTokenService } from './refresh-token.service.js';
import { ChangePasswordDto } from '../dto/requests/change-password.dto.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly createActivityLog: CreateActivityLogService,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Password authentication is not available for this account.',
      );
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const security = await this.prismaService.securitySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    if (newPassword.length < security.minimumPasswordLength) {
      throw new BadRequestException(
        `Password must be at least ${security.minimumPasswordLength} characters long.`,
      );
    }

    const isSamePassword = await comparePassword(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from your current password.',
      );
    }

    const password = await hashPassword(
      newPassword,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    /**
     * Revoke all active sessions for the user
     * after changing the password.
     */
    await this.refreshTokenService.revokeAll(userId);
    await this.createActivityLog.execute({
      type: ActivityType.PASSWORD_CHANGE,
      module: ActivityModule.AUTH,
      action: 'CHANGE_PASSWORD',
      description: 'User password changed successfully',
      entityType: 'User',
      entityId: userId,
      userId,
    });
  }
}
