import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserJwtPayload } from '../interfaces/user-jwt-payload.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission, Role } from '@/lib/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<
            Permission[]
        >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

        // No @()PermissionsGuard → allow authenticated user
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: UserJwtPayload = request.user;

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        if (user.role === Role.SUPER_ADMIN) {
            return true;
        }

        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: {
                role: user.role,
            },
            select: {
                permission: true,
            },
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
