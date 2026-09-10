import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateUserStatusDto } from '../dto/requests/update-user-status.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class UpdateUserStatusService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        updateUserStatusDto: UpdateUserStatusDto,
    ): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                status: updateUserStatusDto.status,
            },
        });

        return updatedUser;
    }
}
