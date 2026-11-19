import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import type { UserJwtPayload } from '../interfaces/user-jwt-payload.interface.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import {
  Permission,
  Role,
} from '../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';

type AuthenticatedRequest = Request & { user?: UserJwtPayload };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      select: { permission: true },
    });

    const allowedPermissions = new Set(
      rolePermissions.map((item) => item.permission),
    );
    const hasAllPermissions = requiredPermissions.every((permission) =>
      allowedPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
