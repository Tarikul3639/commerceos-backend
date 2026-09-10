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

        return user;
    }
}
