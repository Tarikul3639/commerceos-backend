import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  Permission,
  Role,
} from '../../../infrastructure/database/generated/prisma/enums.js';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

@Injectable()
export class UpdateRolePermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Replace the permissions assigned to a role without allowing the SUPER_ADMIN role to be modified.
   */
  async execute(role: Role, permissions: Permission[], actorRole: Role) {
    if (actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can manage role permission assignments.',
      );
    }

    if (role === Role.SUPER_ADMIN) {
      throw new BadRequestException(
        'The SUPER_ADMIN role permissions cannot be modified.',
      );
    }

    const uniquePermissions = [...new Set(permissions)];

    return this.prisma.$transaction(async (tx) => {
      // Remove permissions that are no longer selected
      await tx.rolePermission.deleteMany({
        where: {
          role,
          permission: {
            notIn: uniquePermissions,
          },
        },
      });

      // Add newly selected permissions
      if (uniquePermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: uniquePermissions.map((permission) => ({
            role,
            permission,
          })),
          skipDuplicates: true,
        });
      }

      const updatedPermissions = await tx.rolePermission.findMany({
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
        permissions: updatedPermissions.map((item) => item.permission),
      };
    });
  }
}
