import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';

import { Prisma, CustomerStatus } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '@/common/mail/mail.service';

import { CustomerTokenService } from './token.service';

@Injectable()
export class CustomerVerifyEmailService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly tokenService: CustomerTokenService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Send a fresh email verification link only for an active, unverified customer.
   */
  async execute(customerId: string): Promise<void> {
    const customer = await this.prismaService.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        status: true,
      },
    });

    if (!customer || customer.status !== CustomerStatus.ACTIVE) {
      throw new UnauthorizedException('Customer account is not active.');
    }

    if (customer.isVerified) {
      throw new BadRequestException('Customer is already verified.');
    }

    const token = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresIn = this.configService.getOrThrow<StringValue>(
      'auth.customer.emailVerificationExpiresIn',
    );
    const expiresAt = new Date(Date.now() + ms(expiresIn));

    await this.prismaService.$transaction(async (tx) => {
      await tx.customerEmailVerificationToken.updateMany({
        where: {
          customerId: customer.id,
          verifiedAt: null,
        },
        data: { verifiedAt: new Date() },
      });

      await tx.customerEmailVerificationToken.create({
        data: {
          tokenHash,
          expiresAt,
          customerId: customer.id,
        },
      });
    });

    const frontendUrl = this.configService.getOrThrow<string>(
      'customer.frontendUrl',
    );
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailService.sendVerifyEmail(customer.email, {
      appName: this.configService.getOrThrow<string>('app.name'),
      name: customer.name,
      verificationUrl,
      expireIn: expiresIn,
      year: new Date().getFullYear(),
    });
  }

  /**
   * Verify an email token once and only while its customer account remains active.
   */
  async verify(token: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(token);
    const now = new Date();

    const verificationToken =
      await this.prismaService.customerEmailVerificationToken.findUnique({
        where: { tokenHash },
        include: {
          customer: {
            select: {
              status: true,
              isVerified: true,
            },
          },
        },
      });

    if (
      !verificationToken ||
      verificationToken.verifiedAt ||
      verificationToken.expiresAt <= now ||
      verificationToken.customer.status !== CustomerStatus.ACTIVE ||
      verificationToken.customer.isVerified
    ) {
      throw new UnauthorizedException('Invalid or expired verification token.');
    }

    await this.prismaService.$transaction(
      async (tx) => {
        const tokenUpdate = await tx.customerEmailVerificationToken.updateMany({
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

        const customerUpdate = await tx.customer.updateMany({
          where: {
            id: verificationToken.customerId,
            status: CustomerStatus.ACTIVE,
            deletedAt: null,
            isVerified: false,
          },
          data: { isVerified: true },
        });

        if (customerUpdate.count === 0) {
          throw new UnauthorizedException('Customer account is not active.');
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
