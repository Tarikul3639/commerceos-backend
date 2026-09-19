import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CurrentUserResponseDto } from '../dto/responses/current-user-response.dto';

@Injectable()
export class GetCurrentUserService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<CurrentUserResponseDto> {
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
                isVerified: true,
                lastLoginAt: true,

                role: {
                    select: {
                        name: true,

                        rolePermissions: {
                            select: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            role: user.role.name,
            permissions: user.role.rolePermissions.map(
                (rolePermission) => rolePermission.permission,
            ),
        };
    }
}
