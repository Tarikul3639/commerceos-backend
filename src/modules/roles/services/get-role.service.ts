import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { RoleResponseDto } from '../dto/responses/role-response.dto';

@Injectable()
export class GetRoleService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        roleId: string,
    ): Promise<RoleResponseDto> {
        const role = await this.prisma.role.findUnique({
            where: {
                id: roleId,
            },

            include: {
                rolePermissions: true,

                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });

        if (!role) {
            throw new NotFoundException(
                'Role not found',
            );
        }

        return {
            id: role.id,
            name: role.name,
            description: role.description,

            permissions: role.rolePermissions.map(
                (rolePermission) =>
                    rolePermission.permission,
            ),

            userCount: role._count.users,

            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
        };
    }
}