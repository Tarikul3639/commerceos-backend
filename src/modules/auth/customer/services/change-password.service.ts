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

import { CustomerRefreshTokenService } from './refresh-token.service';
import { ChangePasswordDto } from '../dto/requests/change-password.dto';

@Injectable()
export class CustomerChangePasswordService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly refreshTokenService: CustomerRefreshTokenService,
    ) { }

    async execute(
        customerId: string,
        dto: ChangePasswordDto,
    ): Promise<void> {
        const customer = await this.prismaService.customer.findUnique({
            where: {
                id: customerId,
            },
            select: {
                id: true,
                password: true,
            },
        });

        if (!customer) {
            throw new UnauthorizedException('Customer not found.');
        }

        const isCurrentPasswordValid = await comparePassword(
            dto.currentPassword,
            customer.password,
        );

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect.');
        }

        const isSamePassword = await comparePassword(
            dto.newPassword,
            customer.password,
        );

        if (isSamePassword) {
            throw new BadRequestException(
                'New password must be different from your current password.',
            );
        }

        const hashedPassword = await hashPassword(
            dto.newPassword,
            this.configService.getOrThrow<number>('bcrypt.saltRounds'),
        );

        await this.prismaService.customer.update({
            where: {
                id: customerId,
            },
            data: {
                password: hashedPassword,
            },
        });

        /**
         * Revoke all active sessions after
         * changing the password.
         */
        await this.refreshTokenService.revokeAll(customerId);
    }
}
