import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserJwtPayload } from '../interfaces/user-jwt-payload.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionName } from '@/lib/prisma/enums';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<
            PermissionName[]
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

        const hasAllPermissions = requiredPermissions.every((permission) =>
            user.permissions.includes(permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('You do not have the required permissions');
        }

        return true;
    }
}
