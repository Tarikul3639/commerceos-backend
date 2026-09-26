import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateUserStatusDto } from '../dto/requests/update-user-status.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class UpdateUserStatusService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        requesterId: string,
        updateUserStatusDto: UpdateUserStatusDto,
    ): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                status: true,
                isVerified: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Cannot change own status
        if (userId === requesterId) {
            throw new BadRequestException('You cannot change your own status');
        }

        // Cannot change SUPER_ADMIN status
        if (user.role === 'SUPER_ADMIN') {
            throw new BadRequestException('SUPER_ADMIN status cannot be changed');
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                status: updateUserStatusDto.status,
            },
        });

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            status: updatedUser.status,
            isVerified: updatedUser.isVerified,
            lastLoginAt: updatedUser.lastLoginAt,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }
}
