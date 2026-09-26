import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class GetUserService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
