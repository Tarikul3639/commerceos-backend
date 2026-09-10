import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import ms, { type StringValue } from 'ms';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { MailService } from '../../../../common/mail/mail.service';

import { TokenService } from '../services/token.service';

@Injectable()
export class ForgotPasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService,
    ) { }

    async execute(email: string): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User with the provided email does not exist.');
        }

        const token = this.tokenService.generateRandomToken();
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.user.passwordResetExpiresIn',
        );

        const expiresAt = new Date(Date.now() + ms(expiresIn));
        const tokenHash = this.tokenService.hashToken(token);

        await this.prismaService.userPasswordResetToken.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
            },
            data: {
                usedAt: new Date(),
            },
        });

        await this.prismaService.userPasswordResetToken.create({
            data: {
                tokenHash,
                expiresAt,
                userId: user.id,
            },
        });

        const frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
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
