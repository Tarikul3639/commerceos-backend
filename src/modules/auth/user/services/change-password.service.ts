import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import {
    comparePassword,
    hashPassword,
} from '../../../../common/utils/password.util';

import { RefreshTokenService } from './refresh-token.service';
import { ChangePasswordDto } from '../dto/requests/change-password.dto';

@Injectable()
export class ChangePasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly refreshTokenService: RefreshTokenService,
    ) { }

    async execute(
        userId: string,
        dto: ChangePasswordDto,
    ): Promise<void> {
        const { currentPassword, newPassword } = dto;

        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                password: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        if (!user.password) {
            throw new BadRequestException(
                'Password authentication is not available for this account.',
            );
        }

        const isPasswordValid = await comparePassword(
            currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Current password is incorrect.',
            );
        }

        const isSamePassword = await comparePassword(
            newPassword,
            user.password,
        );

        if (isSamePassword) {
            throw new BadRequestException(
                'New password must be different from your current password.',
            );
        }

        const password = await hashPassword(
            newPassword,
            this.configService.getOrThrow<number>(
                'bcrypt.saltRounds',
            ),
        );

        await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                password,
            },
        });

        /**
         * Revoke all active sessions for the user
         * after changing the password.
         */
        await this.refreshTokenService.revokeAll(userId);
    }
}