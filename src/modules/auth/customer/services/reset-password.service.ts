import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Prisma, CustomerStatus } from '../../../../lib/prisma/client.js';
import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { hashPassword } from '../../../../common/utils/password.util.js';

import { CustomerTokenService } from './token.service.js';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto.js';

@Injectable()
export class CustomerResetPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: CustomerTokenService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Reset an active customer's password once and revoke all existing refresh sessions.
   */
  async execute(dto: ResetPasswordDto): Promise<void> {
    const { token, password } = dto;
    const tokenHash = this.tokenService.hashToken(token);
    const now = new Date();

    const resetTokenRecord =
      await this.prismaService.customerPasswordResetToken.findFirst({
        where: { tokenHash },
        include: {
          customer: {
            select: { status: true },
          },
        },
      });

    if (
      !resetTokenRecord ||
      resetTokenRecord.usedAt ||
      resetTokenRecord.expiresAt <= now ||
      resetTokenRecord.customer.status !== CustomerStatus.ACTIVE
    ) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
    }

    const hashedPassword = await hashPassword(
      password,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    await this.prismaService.$transaction(
      async (tx) => {
        const tokenUpdate = await tx.customerPasswordResetToken.updateMany({
          where: {
            id: resetTokenRecord.id,
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

        const customerUpdate = await tx.customer.updateMany({
          where: {
            id: resetTokenRecord.customerId,
            status: CustomerStatus.ACTIVE,
            deletedAt: null,
          },
          data: { password: hashedPassword },
        });

        if (customerUpdate.count === 0) {
          throw new UnauthorizedException('Customer account is not active.');
        }

        await tx.customerPasswordResetToken.updateMany({
          where: {
            customerId: resetTokenRecord.customerId,
            usedAt: null,
          },
          data: { usedAt: now },
        });

        await tx.customerRefreshToken.updateMany({
          where: {
            customerId: resetTokenRecord.customerId,
            revokedAt: null,
          },
          data: { revokedAt: now },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
