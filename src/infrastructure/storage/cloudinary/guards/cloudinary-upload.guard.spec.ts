import { vi } from 'vitest';
vi.mock('../../../database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CloudinaryUploadGuard } from './cloudinary-upload.guard.js';
import { Permission, Role } from '../../../../infrastructure/database/generated/prisma/enums.js';

describe('CloudinaryUploadGuard', () => {
  const context = (folder: string, role: Role | undefined) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { folder },
          ...(role ? { user: { id: 'staff-1', role } } : {}),
        }),
      }),
    }) as unknown as ExecutionContext;

  it('allows an authorized product uploader with either create or update permission', async () => {
    const prisma = {
      rolePermission: {
        findMany: vi.fn().mockResolvedValue([{ permission: Permission.PRODUCT_CREATE }]),
      },
    };
    const guard = new CloudinaryUploadGuard(prisma as never);
    await expect(guard.canActivate(context('products', Role.EMPLOYEE))).resolves.toBe(true);
    expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
      where: {
        role: Role.EMPLOYEE,
        permission: { in: [Permission.PRODUCT_CREATE, Permission.PRODUCT_UPDATE] },
      },
      select: { permission: true },
      take: 1,
    });
  });

  it('rejects staff without a matching folder permission', async () => {
    const prisma = { rolePermission: { findMany: vi.fn().mockResolvedValue([]) } };
    const guard = new CloudinaryUploadGuard(prisma as never);
    await expect(guard.canActivate(context('banners', Role.EMPLOYEE))).rejects.toThrow(ForbiddenException);
  });

  it('rejects folders that have no upload permission mapping', async () => {
    const prisma = { rolePermission: { findMany: vi.fn() } };
    const guard = new CloudinaryUploadGuard(prisma as never);
    await expect(guard.canActivate(context('reports', Role.ADMIN))).rejects.toThrow(ForbiddenException);
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled();
  });

  it('allows SUPER_ADMIN without querying role grants', async () => {
    const prisma = { rolePermission: { findMany: vi.fn() } };
    const guard = new CloudinaryUploadGuard(prisma as never);
    await expect(guard.canActivate(context('products', Role.SUPER_ADMIN))).resolves.toBe(true);
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled();
  });

  it('rejects requests without a staff identity', async () => {
    const prisma = { rolePermission: { findMany: vi.fn() } };
    const guard = new CloudinaryUploadGuard(prisma as never);
    await expect(guard.canActivate(context('products', undefined))).rejects.toThrow(ForbiddenException);
  });
});
