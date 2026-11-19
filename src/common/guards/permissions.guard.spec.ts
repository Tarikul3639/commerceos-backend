import { vi } from 'vitest';

vi.mock('../prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsGuard } from './permissions.guard.js';
import { Permission, Role } from '../../lib/prisma/enums.js';

describe('PermissionsGuard', () => {
  const handler = () => undefined;
  const controller = class TestController {};

  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };
  let prisma: { rolePermission: { findMany: ReturnType<typeof vi.fn> } };
  let guard: PermissionsGuard;

  const createContext = (user?: { role: Role }) =>
    ({
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: vi.fn(),
    };
    prisma = {
      rolePermission: {
        findMany: vi.fn(),
      },
    };
    guard = new PermissionsGuard(
      reflector as unknown as Reflector,
      prisma as never,
    );
  });

  it('allows an authenticated route with no permission metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(
      guard.canActivate(createContext({ role: Role.EMPLOYEE })),
    ).resolves.toBe(true);
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled();
  });

  it('rejects a request without an authenticated user when permission is required', async () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.CUSTOMER_READ]);

    await expect(guard.canActivate(createContext())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows SUPER_ADMIN without querying role grants', async () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.CUSTOMER_DELETE]);

    await expect(
      guard.canActivate(createContext({ role: Role.SUPER_ADMIN })),
    ).resolves.toBe(true);
    expect(prisma.rolePermission.findMany).not.toHaveBeenCalled();
  });

  it('allows a role with the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.CUSTOMER_READ]);
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: Permission.CUSTOMER_READ },
      { permission: Permission.ORDER_READ },
    ]);

    await expect(
      guard.canActivate(createContext({ role: Role.ADMIN })),
    ).resolves.toBe(true);
    expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
      select: { permission: true },
    });
  });

  it('rejects a role missing the required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue([Permission.CUSTOMER_DELETE]);
    prisma.rolePermission.findMany.mockResolvedValue([
      { permission: Permission.CUSTOMER_READ },
    ]);

    await expect(
      guard.canActivate(createContext({ role: Role.EMPLOYEE })),
    ).rejects.toThrow(ForbiddenException);
  });
});
