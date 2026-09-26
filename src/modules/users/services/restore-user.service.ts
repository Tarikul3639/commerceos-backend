import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { Role, UserStatus } from '../../../lib/prisma/enums';

@Injectable()
export class RestoreUserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(userId: string): Promise<UserResponseDto> {
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
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        if (user.role === Role.SUPER_ADMIN) {
            throw new BadRequestException(
                'SUPER_ADMIN user cannot be restored',
            )
        }

        if (user.status !== UserStatus.DELETED) {
            throw new BadRequestException(
                'Only deleted users can be restored',
            )
        }

        const restoredUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                status: UserStatus.ACTIVE,
                deletedAt: null,
            },
        })

        return {
            id: restoredUser.id,
            name: restoredUser.name,
            email: restoredUser.email,
            phone: restoredUser.phone,
            avatar: restoredUser.avatar,
            role: restoredUser.role,
            status: restoredUser.status,
            isVerified: restoredUser.isVerified,
            lastLoginAt: restoredUser.lastLoginAt,
            createdAt: restoredUser.createdAt,
            updatedAt: restoredUser.updatedAt,
        }
    }
}