import { Injectable } from '@nestjs/common';

import { Permission, Role } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';

import { RolePermissionsResponseDto } from '../dto/responses/role-permissions.response.dto';

@Injectable()
export class GetRolesPermissionsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(): Promise<RolePermissionsResponseDto[]> {
        const roles = Object.values(Role);

        return Promise.all(
            roles.map(async (role) => {
                const permissions = await this.getRolePermissions(role);

                return {
                    role,
                    permissions,
                };
            }),
        );
    }

    private async getRolePermissions(role: Role): Promise<Permission[]> {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: {
                role,
            },
            select: {
                permission: true,
            },
            orderBy: {
                permission: 'asc',
            },
        });

        return rolePermissions.map(({ permission }) => permission);
    }
}
