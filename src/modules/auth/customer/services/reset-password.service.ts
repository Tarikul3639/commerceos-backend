import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { hashPassword } from '../../../../common/utils/password.util';

import { CustomerTokenService } from '../services/token.service';
import { ResetPasswordDto } from '../dto/requests/reset-password.dto';

@Injectable()
export class CustomerResetPasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly tokenService: CustomerTokenService,
        private readonly configService: ConfigService,
    ) { }

    async execute(dto: ResetPasswordDto): Promise<void> {
        const { token, password } = dto;

        const tokenHash = this.tokenService.hashToken(token);

        const resetTokenRecord =
            await this.prismaService.customerPasswordResetToken.findFirst({
                where: {
                    tokenHash,
                },
            });

        if (!resetTokenRecord) {
            throw new Error('Invalid or expired password reset token.');
        }

        if (resetTokenRecord.usedAt) {
            throw new Error('Password reset token has already been used.');
        }

        if (resetTokenRecord.expiresAt <= new Date()) {
            throw new Error('Password reset token has expired.');
        }

        const hashedPassword = await hashPassword(
            password,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        /**
         *  Transaction to update the customer's password and mark the reset token as used.
         *  This ensures that both operations are atomic, preventing any inconsistencies.
         *  If either operation fails, the entire transaction will be rolled back.
         */
        await this.prismaService.$transaction([
            this.prismaService.customer.update({
                where: {
                    id: resetTokenRecord.customerId,
                },
                data: {
                    password: hashedPassword,
                },
            }),

            // Mark the reset token as used
            this.prismaService.customerPasswordResetToken.update({
                where: {
                    id: resetTokenRecord.id,
                },
                data: {
                    usedAt: new Date(),
                },
            }),

            // Invalidate any other unused tokens for the same customer
            this.prismaService.customerPasswordResetToken.updateMany({
                where: {
                    customerId: resetTokenRecord.customerId,
                    usedAt: null,
                },
                data: {
                    usedAt: new Date(),
                },
            }),
        ]);
    }
}