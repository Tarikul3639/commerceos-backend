import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../lib/prisma/enums.js';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
