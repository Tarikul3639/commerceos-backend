import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { RoleResponseDto } from '../dto/responses/role-response.dto';
import { RoleName } from '@/lib/prisma/enums';

@Injectable()
export class GetRolesService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(): Promise<RoleResponseDto[]> {
        const roles = await this.prisma.role.findMany({
            where: {
                name: {
                    not: RoleName.SUPER_ADMIN
                }
            },
            include: {
                rolePermissions: true,

                _count: {
                    select: {
                        users: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc',
            },
        });

        return roles.map((role) => ({
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
        }));
    }
}