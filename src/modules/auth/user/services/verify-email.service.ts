import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import ms, { type StringValue } from 'ms';

import { Prisma, UserStatus } from '../../../../lib/prisma/client.js';
import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { MailService } from '../../../../common/mail/mail.service.js';

import { TokenService } from './token.service.js';

@Injectable()
export class VerifyEmailService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Send a verification link for an active, unverified staff account.
   */
  async sendVerificationEmailByUserId(userId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        status: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active.');
    }

    if (user.isVerified) {
      return;
    }

    await this.sendVerificationEmail(user);
  }

  /**
   * Send verification without revealing whether an email belongs to an active user.
   */
  async sendVerificationEmailByEmail(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        status: true,
      },
    });

    if (!user || user.isVerified || user.status !== UserStatus.ACTIVE) {
      return;
    }

    await this.sendVerificationEmail(user);
  }

  /**
   * Replace any previous unused verification tokens before sending a new one.
   */
  private async sendVerificationEmail(user: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    status: UserStatus;
  }): Promise<void> {
    const token = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresIn = this.configService.getOrThrow<StringValue>(
      'auth.user.emailVerificationExpiresIn',
    );
    const expiresAt = new Date(Date.now() + ms(expiresIn));
    const now = new Date();

    await this.prismaService.$transaction(async (tx) => {
      await tx.userEmailVerificationToken.updateMany({
        where: {
          userId: user.id,
          verifiedAt: null,
        },
        data: { verifiedAt: now },
      });

      await tx.userEmailVerificationToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId: user.id,
        },
      });
    });

    const frontendUrl =
      this.configService.getOrThrow<string>('app.frontendUrl');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailService.sendVerifyEmail(user.email, {
      appName: this.configService.getOrThrow<string>('app.name'),
      name: user.name,
      verificationUrl,
      expireIn: expiresIn,
      year: new Date().getFullYear(),
    });
  }

  /**
   * Consume a verification token once and only for an active, unverified account.
   */
  async verify(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const now = new Date();

    const verificationToken =
      await this.prismaService.userEmailVerificationToken.findUnique({
        where: { tokenHash },
        include: {
          user: {
            select: {
              status: true,
              deletedAt: true,
              isVerified: true,
            },
          },
        },
      });

    if (
      !verificationToken ||
      verificationToken.verifiedAt ||
      verificationToken.expiresAt <= now ||
      verificationToken.user.status !== UserStatus.ACTIVE ||
      verificationToken.user.deletedAt ||
      verificationToken.user.isVerified
    ) {
      throw new UnauthorizedException('Invalid or expired verification token.');
    }

    await this.prismaService.$transaction(
      async (tx) => {
        const tokenUpdate = await tx.userEmailVerificationToken.updateMany({
          where: {
            id: verificationToken.id,
            verifiedAt: null,
            expiresAt: { gt: now },
          },
          data: { verifiedAt: now },
        });

        if (tokenUpdate.count === 0) {
          throw new UnauthorizedException(
            'Invalid or expired verification token.',
          );
        }

        const userUpdate = await tx.user.updateMany({
          where: {
            id: verificationToken.userId,
            status: UserStatus.ACTIVE,
            deletedAt: null,
            isVerified: false,
          },
          data: { isVerified: true },
        });

        if (userUpdate.count === 0) {
          throw new UnauthorizedException('User account is not active.');
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
