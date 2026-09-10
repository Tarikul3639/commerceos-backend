import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import ms, { type StringValue } from 'ms';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { MailService } from '../../../../common/mail/mail.service';

import { TokenService } from '../services/token.service';

@Injectable()
export class VerifyEmailService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
    ) { }

    async execute(userId: string): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },

            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        if (user.isVerified) {
            return;
        }

        const token = this.tokenService.generateRandomToken();
        const tokenHash = this.tokenService.hashToken(token);
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.user.emailVerificationExpiresIn',
        );

        const expiresAt = new Date(Date.now() + ms(expiresIn));

        // Invalidate previous unused verification tokens
        await this.prismaService.userEmailVerificationToken.updateMany({
            where: {
                userId: user.id,
                verifiedAt: null,
            },

            data: {
                verifiedAt: new Date(),
            },
        });

        await this.prismaService.userEmailVerificationToken.create({
            data: {
                tokenHash,
                expiresAt,
                userId: user.id,
            },
        });

        const frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
        const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

        await this.mailService.sendVerifyEmail(user.email, {
            appName: this.configService.getOrThrow<string>('app.name'),
            name: user.name,
            verificationUrl,
            expireIn: expiresIn,
            year: new Date().getFullYear(),
        });
    }

    async verify(token: string): Promise<void> {
        const tokenHash = this.tokenService.hashToken(token);

        const verificationToken =
            await this.prismaService.userEmailVerificationToken.findUnique({
                where: {
                    tokenHash,
                },

                include: {
                    user: true,
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
            this.prismaService.user.update({
                where: {
                    id: verificationToken.userId,
                },

                data: {
                    isVerified: true,
                },
            }),

            this.prismaService.userEmailVerificationToken.update({
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
