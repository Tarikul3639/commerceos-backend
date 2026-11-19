import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Prisma, UserStatus } from '../../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { TokenService } from './token.service.js';
import { hashPassword } from '../../../../common/utils/password.util.js';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Consume a password setup/reset token once, verify the email and revoke all existing sessions.
   */
  async execute(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const now = new Date();

    const passwordResetToken =
      await this.prismaService.userPasswordResetToken.findUnique({
        where: { tokenHash },
        include: {
          user: {
            select: {
              status: true,
              deletedAt: true,
            },
          },
        },
      });

    if (
      !passwordResetToken ||
      passwordResetToken.usedAt ||
      passwordResetToken.expiresAt <= now ||
      passwordResetToken.user.status !== UserStatus.ACTIVE ||
      passwordResetToken.user.deletedAt
    ) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
    }

    const security = await this.prismaService.securitySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });

    if (newPassword.length < security.minimumPasswordLength) {
      throw new UnauthorizedException(
        `Password must be at least ${security.minimumPasswordLength} characters long.`,
      );
    }

    const passwordHash = await hashPassword(
      newPassword,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    await this.prismaService.$transaction(
      async (tx) => {
        const tokenUpdate = await tx.userPasswordResetToken.updateMany({
          where: {
            id: passwordResetToken.id,
            usedAt: null,
            expiresAt: { gt: now },
          },
          data: { usedAt: now },
        });

        if (tokenUpdate.count === 0) {
          throw new UnauthorizedException(
            'Invalid or expired password reset token.',
          );
        }

        const userUpdate = await tx.user.updateMany({
          where: {
            id: passwordResetToken.userId,
            status: UserStatus.ACTIVE,
            deletedAt: null,
          },
          data: {
            password: passwordHash,
            isVerified: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        });

        if (userUpdate.count === 0) {
          throw new UnauthorizedException('User account is not active.');
        }

        await tx.userPasswordResetToken.updateMany({
          where: {
            userId: passwordResetToken.userId,
            usedAt: null,
          },
          data: { usedAt: now },
        });

        await tx.userRefreshToken.updateMany({
          where: {
            userId: passwordResetToken.userId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
