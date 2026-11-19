import { vi } from 'vitest';
vi.mock('../../../infrastructure/database/generated/prisma/client.js', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
vi.mock('../../../infrastructure/database/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock(
  '../../../infrastructure/storage/cloudinary/services/cloudinary.service.js',
  () => ({
    CloudinaryService: class CloudinaryService {},
  }),
);
vi.mock('../../activity-logs/services/create-activity-log.service.js', () => ({
  CreateActivityLogService: class CreateActivityLogService {},
}));

import { ForbiddenException } from '@nestjs/common';

import { Role } from '../../../infrastructure/database/generated/prisma/enums.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CloudinaryService } from '../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { UpdateUserService } from './update-user.service.js';

describe('UpdateUserService', () => {
  it('prevents ADMIN from updating another ADMIN account', async () => {
    const prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'admin-target',
          role: Role.ADMIN,
        }),
      },
    };
    const service = new UpdateUserService(
      prisma as unknown as PrismaService,
      {} as CloudinaryService,
      {} as CreateActivityLogService,
    );

    await expect(
      service.execute('admin-target', 'admin-actor', Role.ADMIN, {
        name: 'Updated Name',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
