import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { UpdateUserRoleDto } from '../dto/requests/update-user-role.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

@Injectable()
export class UpdateUserRoleService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        updateUserRoleDto: UpdateUserRoleDto,
    ): Promise<UserResponseDto> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const role = await this.prisma.role.findUnique({
            where: {
                id: updateUserRoleDto.roleId,
            },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                roleId: updateUserRoleDto.roleId,
            },
        });

        return updatedUser;
    }
}
