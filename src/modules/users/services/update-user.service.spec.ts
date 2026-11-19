import { vi } from 'vitest';
vi.mock('../../../lib/prisma/client.js', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
vi.mock('../../../common/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock('../../../common/cloudinary/cloudinary.service.js', () => ({
  CloudinaryService: class CloudinaryService {},
}));
vi.mock('../../activity-logs/services/create-activity-log.service.js', () => ({
  CreateActivityLogService: class CreateActivityLogService {},
}));

import { ForbiddenException } from '@nestjs/common';

import { Role } from '../../../lib/prisma/enums.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service.js';
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
