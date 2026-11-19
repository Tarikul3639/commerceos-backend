import { Injectable } from '@nestjs/common';
import { Role } from '../../../infrastructure/database/generated/prisma/enums.js';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class GetPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get permissions of the currently authenticated user's role.
   */
  async getMyPermissions(role: Role) {
    const permissions = await this.prisma.rolePermission.findMany({
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

    return {
      role,
      permissions: permissions.map((item) => item.permission),
    };
  }

  /**
   * Get permissions assigned to a specific role.
   */
  async getRolePermissions(role: Role) {
    const permissions = await this.prisma.rolePermission.findMany({
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

    return {
      role,
      permissions: permissions.map((item) => item.permission),
    };
  }
}
