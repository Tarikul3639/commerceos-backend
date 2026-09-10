import { Injectable, NotFoundException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { MailService } from '../../../../common/mail/mail.service';

import { ForgotPasswordDto } from '../dto/requests/forgot-password.dto';
import { CustomerTokenService } from '../services/token.service';
import ms, { StringValue } from 'ms';

@Injectable()
export class CustomerForgotPasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: CustomerTokenService,
        private readonly mailService: MailService,
    ) { }

    async execute(dto: ForgotPasswordDto): Promise<void> {
        const { email } = dto;

        const customer = await this.prismaService.customer.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer with the provided email does not exist.');
        }

        const token = this.tokenService.generateRandomToken();
        const expiresIn = this.configService.getOrThrow<StringValue>(
            'auth.customer.passwordResetExpiresIn',
        );

        const expiresAt = new Date(Date.now() + ms(expiresIn));
        const tokenHash = this.tokenService.hashToken(token);

        // Invalidate any existing unused tokens for the customer
        await this.prismaService.customerPasswordResetToken.updateMany({
            where: {
                customerId: customer.id,
                usedAt: null,
            },
            data: {
                usedAt: new Date(),
            },
        });

        // Create a new password reset token for the customer
        await this.prismaService.customerPasswordResetToken.create({
            data: {
                tokenHash,
                expiresAt,
                customerId: customer.id,
            },
        });

        // Construct the reset password URL
        const frontendUrl = this.configService.getOrThrow<string>('app.frontendUrl');
        const resetPasswordUrl = `${frontendUrl}/reset-password?token=${token}`;

        // Send the reset password email to the customer
        await this.mailService.sendResetPasswordEmail(customer.email, {
            appName: this.configService.getOrThrow<string>('app.name'),
            name: customer.name,
            resetPasswordUrl,
            expireIn: expiresIn,
            year: new Date().getFullYear(),
        });
    }
}