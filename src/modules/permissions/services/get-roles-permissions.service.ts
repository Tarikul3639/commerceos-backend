import { Injectable } from '@nestjs/common';

import { Permission } from '../../../lib/prisma/enums.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

import {
  RolePermissionsResponseDto,
  UserRole,
} from '../dto/responses/role-permissions.response.dto.js';

@Injectable()
export class GetRolesPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<RolePermissionsResponseDto[]> {
    const roles = Object.values(UserRole);

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

  private async getRolePermissions(role: UserRole): Promise<Permission[]> {
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
