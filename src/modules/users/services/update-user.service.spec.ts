jest.mock('@/lib/prisma/client', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('@/common/cloudinary/cloudinary.service', () => ({
  CloudinaryService: class CloudinaryService {},
}));
jest.mock(
  '@/modules/activity-logs/services/create-activity-log.service',
  () => ({
    CreateActivityLogService: class CreateActivityLogService {},
  }),
);

import { ForbiddenException } from '@nestjs/common';

import { Role } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { UpdateUserService } from './update-user.service';
import { UpdateUserDto } from '../dto/requests/update-user.dto';

describe('UpdateUserService', () => {
  it('prevents ADMIN from updating another ADMIN account', async () => {
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({
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
      } as UpdateUserDto),
    ).rejects.toThrow(ForbiddenException);
  });
});
