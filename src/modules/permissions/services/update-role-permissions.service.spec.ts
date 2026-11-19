import { vi } from 'vitest';
vi.mock('../../../common/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { ForbiddenException } from '@nestjs/common';

import { Permission, Role } from '../../../lib/prisma/enums.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { UpdateRolePermissionsService } from './update-role-permissions.service.js';

describe('UpdateRolePermissionsService', () => {
  it('rejects role permission changes by non-SUPER_ADMIN actors', async () => {
    const prisma = { $transaction: vi.fn() };
    const service = new UpdateRolePermissionsService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.execute(Role.EMPLOYEE, [Permission.PRODUCT_READ], Role.ADMIN),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('allows SUPER_ADMIN to update non-SUPER_ADMIN role permissions', async () => {
    const tx = {
      rolePermission: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
        findMany: vi
          .fn()
          .mockResolvedValue([{ permission: Permission.PRODUCT_READ }]),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback: (transaction: never) => unknown) =>
        callback(tx as never),
      ),
    };
    const service = new UpdateRolePermissionsService(
      prisma as unknown as PrismaService,
    );

    await expect(
      service.execute(
        Role.EMPLOYEE,
        [Permission.PRODUCT_READ, Permission.PRODUCT_READ],
        Role.SUPER_ADMIN,
      ),
    ).resolves.toEqual({
      role: Role.EMPLOYEE,
      permissions: [Permission.PRODUCT_READ],
    });

    expect(tx.rolePermission.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [{ role: Role.EMPLOYEE, permission: Permission.PRODUCT_READ }],
        skipDuplicates: true,
      }),
    );
  });
});
