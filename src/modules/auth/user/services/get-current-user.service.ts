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
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: {
                role: user.role,
            },
            select: {
                permission: true,
            },
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            role: user.role,
            permissions: rolePermissions.map((row) => row.permission),
        };
    }
}
