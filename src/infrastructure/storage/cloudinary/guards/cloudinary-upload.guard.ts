import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { UserJwtPayload } from '../../../../common/interfaces/user-jwt-payload.interface.js';
import {
  Permission,
  Role,
} from '../../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { CloudinaryFolder } from '../types/cloudinary.types.js';

type UploadRequest = Request & {
  user?: UserJwtPayload;
  params: Request['params'] & { folder?: string };
};

const FOLDER_PERMISSIONS: Record<string, readonly Permission[]> = {
  [CloudinaryFolder.PRODUCTS]: [
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
  ],
  [CloudinaryFolder.CATEGORIES]: [
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_UPDATE,
  ],
  [CloudinaryFolder.BRANDS]: [Permission.BRAND_CREATE, Permission.BRAND_UPDATE],
  [CloudinaryFolder.BANNERS]: [
    Permission.BANNER_CREATE,
    Permission.BANNER_UPDATE,
  ],
  [CloudinaryFolder.USERS]: [Permission.USER_CREATE, Permission.USER_UPDATE],
  [CloudinaryFolder.CUSTOMERS]: [
    Permission.CUSTOMER_CREATE,
    Permission.CUSTOMER_UPDATE,
  ],
  [CloudinaryFolder.SETTINGS]: [Permission.SETTING_UPDATE],
};

@Injectable()
export class CloudinaryUploadGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UploadRequest>();
    const user = request.user;
    if (!user)
      throw new ForbiddenException('Authenticated staff account required');
    if (user.role === Role.SUPER_ADMIN) return true;

    const requiredPermissions = FOLDER_PERMISSIONS[request.params.folder ?? ''];
    if (!requiredPermissions) {
      throw new ForbiddenException('Uploads are not enabled for this folder');
    }

    const grants = await this.prisma.rolePermission.findMany({
      where: {
        role: user.role,
        permission: { in: [...requiredPermissions] },
      },
      select: { permission: true },
      take: 1,
    });
    if (grants.length === 0) {
      throw new ForbiddenException(
        'You do not have permission to upload files to this folder',
      );
    }
    return true;
  }
}
