import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import ms, { type StringValue } from 'ms';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { MailService } from '../../../../common/mail/mail.service';

import { CustomerTokenService } from '../services/token.service';

@Injectable()
export class CustomerVerifyEmailService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: CustomerTokenService,
        private readonly mailService: MailService,
    ) { }

    async execute(customerId: string): Promise<void> {
        const customer = await this.prismaService.customer.findUnique({
            where: {
                id: customerId,
            },

            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
            },
        });

        if (!customer) {
            throw new UnauthorizedException('Customer not found.');
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

        // Invalidate previous unused verification tokens
        await this.prismaService.customerEmailVerificationToken.updateMany({
            where: {
                customerId: customer.id,
                verifiedAt: null,
            },

            data: {
                verifiedAt: new Date(),
            },
        });

        // Create a new verification token
        await this.prismaService.customerEmailVerificationToken.create({
            data: {
                tokenHash,
                expiresAt,
                customerId: customer.id,
            },
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

    async verify(token: string): Promise<void> {
        const tokenHash = this.tokenService.hashToken(token);

        const verificationToken =
            await this.prismaService.customerEmailVerificationToken.findUnique({
                where: {
                    tokenHash,
                },

                include: {
                    customer: true,
                },
            });

        if (!verificationToken) {
            throw new UnauthorizedException('Invalid verification token.');
        }

        if (verificationToken.verifiedAt) {
            throw new UnauthorizedException(
                'Verification token has already been used.',
            );
        }

        if (verificationToken.expiresAt <= new Date()) {
            throw new UnauthorizedException('Verification token has expired.');
        }

        await this.prismaService.$transaction([
            this.prismaService.customer.update({
                where: {
                    id: verificationToken.customerId,
                },

                data: {
                    isVerified: true,
                },
            }),

            this.prismaService.customerEmailVerificationToken.update({
                where: {
                    id: verificationToken.id,
                },

                data: {
                    verifiedAt: new Date(),
                },
            }),
        ]);
    }
}
