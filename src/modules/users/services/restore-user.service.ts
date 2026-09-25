import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserResponseDto } from '../dto/responses/user-response.dto';
import { RoleName, UserStatus } from '../../../lib/prisma/enums';

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
            include: {
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        if (user.role.name === RoleName.SUPER_ADMIN) {
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
            include: {
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        return {
            id: restoredUser.id,
            name: restoredUser.name,
            email: restoredUser.email,
            phone: restoredUser.phone,
            avatar: restoredUser.avatar,
            role: restoredUser.role.name,
            status: restoredUser.status,
            isVerified: restoredUser.isVerified,
            lastLoginAt: restoredUser.lastLoginAt,
            createdAt: restoredUser.createdAt,
            updatedAt: restoredUser.updatedAt,
        }
    }
}