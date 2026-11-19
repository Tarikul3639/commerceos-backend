import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import ms, { type StringValue } from 'ms';

import { PrismaService } from '@/common/prisma/prisma.service';
import { UserStatus } from '@/lib/prisma/client';
import { MailService } from '@/common/mail/mail.service';

import { TokenService } from './token.service';

@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Send a reset link only to active users without revealing whether an email is registered.
   */
  async execute(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }

    const token = this.tokenService.generateRandomToken();
    const expiresIn = this.configService.getOrThrow<StringValue>(
      'auth.user.passwordResetExpiresIn',
    );
    const expiresAt = new Date(Date.now() + ms(expiresIn));
    const tokenHash = this.tokenService.hashToken(token);

    await this.prismaService.$transaction(async (tx) => {
      await tx.userPasswordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      await tx.userPasswordResetToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId: user.id,
        },
      });
    });

    const frontendUrl =
      this.configService.getOrThrow<string>('app.frontendUrl');
    const resetPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail(user.email, {
      appName: this.configService.getOrThrow<string>('app.name'),
      name: user.name,
      resetPasswordUrl,
      expireIn: expiresIn,
      year: new Date().getFullYear(),
    });
  }
}
