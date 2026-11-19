import { vi } from 'vitest';
vi.mock('../../../infrastructure/database/generated/prisma/client.js', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
vi.mock('../../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock('../../activity-logs/services/create-activity-log.service.js', () => ({
  CreateActivityLogService: class CreateActivityLogService {},
}));

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { Role, UserStatus } from '../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { DeleteUserService } from './delete-user.service.js';

describe('DeleteUserService', () => {
  const activeEmployee = {
    role: Role.EMPLOYEE,
    status: UserStatus.ACTIVE,
    deletedAt: null,
    _count: {},
  };

  it('prevents a user from deleting their own account', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(activeEmployee),
      },
    };
    const service = new DeleteUserService(
      prisma as unknown as PrismaService,
      {} as CreateActivityLogService,
    );

    await expect(
      service.execute('same-user', 'same-user', Role.ADMIN),
    ).rejects.toThrow(BadRequestException);
  });

  it('prevents ADMIN from deleting another ADMIN account', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          ...activeEmployee,
          role: Role.ADMIN,
        }),
      },
    };
    const service = new DeleteUserService(
      prisma as unknown as PrismaService,
      {} as CreateActivityLogService,
    );

    await expect(
      service.execute('admin-target', 'admin-actor', Role.ADMIN),
    ).rejects.toThrow(ForbiddenException);
  });
});
