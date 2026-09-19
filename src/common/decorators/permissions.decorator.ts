import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '@/lib/prisma/enums';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: PermissionName[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
