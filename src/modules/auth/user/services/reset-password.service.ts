import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { TokenService } from '../services/token.service';

import { hashPassword } from '../../../../common/utils/password.util';

@Injectable()
export class ResetPasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly tokenService: TokenService,
    ) { }

    async execute(token: string, newPassword: string): Promise<void> {
        const tokenHash = this.tokenService.hashToken(token);

        const passwordResetToken =
            await this.prismaService.userPasswordResetToken.findUnique({
                where: {
                    tokenHash,
                },
            });

        if (!passwordResetToken) {
            throw new UnauthorizedException('Invalid password reset token.');
        }

        if (passwordResetToken.usedAt) {
            throw new UnauthorizedException(
                'Password reset token has already been used.',
            );
        }

        if (passwordResetToken.expiresAt <= new Date()) {
            throw new UnauthorizedException('Password reset token has expired.');
        }

        const passwordHash = await hashPassword(
            newPassword,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        await this.prismaService.$transaction([
            this.prismaService.user.update({
                where: {
                    id: passwordResetToken.userId,
                },

                data: {
                    password: passwordHash,
                },
            }),

            this.prismaService.userPasswordResetToken.update({
                where: {
                    id: passwordResetToken.id,
                },

                data: {
                    usedAt: new Date(),
                },
            }),

            this.prismaService.userPasswordResetToken.updateMany({
                where: {
                    userId: passwordResetToken.userId,
                    usedAt: null,
                },

                data: {
                    usedAt: new Date(),
                },
            }),

            this.prismaService.userRefreshToken.updateMany({
                where: {
                    userId: passwordResetToken.userId,
                    revokedAt: null,
                },

                data: {
                    revokedAt: new Date(),
                },
            }),
        ]);
    }
}
