jest.mock('@/lib/prisma/client', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock(
  '@/modules/activity-logs/services/create-activity-log.service',
  () => ({
    CreateActivityLogService: class CreateActivityLogService {},
  }),
);

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { Role, UserStatus } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { DeleteUserService } from './delete-user.service';

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
        findUnique: jest.fn().mockResolvedValue(activeEmployee),
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
        findUnique: jest.fn().mockResolvedValue({
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
