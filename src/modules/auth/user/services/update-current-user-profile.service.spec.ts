import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CloudinaryService } from '../../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';

import { GetCurrentUserService } from './get-current-user.service.js';
import { UpdateCurrentUserProfileService } from './update-current-user-profile.service.js';

describe('UpdateCurrentUserProfileService', () => {
  let module: TestingModule;
  let service: UpdateCurrentUserProfileService;

  const existingUser = {
    id: 'staff-1',
    name: 'Old Name',
    phone: null,
    avatar: null,
    publicId: null,
  };

  const updatedUser = {
    ...existingUser,
    name: 'New Name',
    phone: '+8801712345678',
    avatar: 'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
    publicId: 'commerceos/users/staff-1/avatar',
  };

  const transaction = {
    user: {
      update: vi.fn(),
    },
  };

  const prisma = {
    user: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const cloudinary = {
    delete: vi.fn(),
    isUserAssetOwnedBy: vi.fn(),
  };

  const activityLog = {
    execute: vi.fn(),
  };

  const getCurrentUser = {
    execute: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prisma.user.findFirst.mockResolvedValue(existingUser);
    prisma.$transaction.mockImplementation(
      async (callback: (tx: typeof transaction) => Promise<unknown>) =>
        callback(transaction),
    );
    transaction.user.update.mockResolvedValue(updatedUser);
    cloudinary.isUserAssetOwnedBy.mockReturnValue(true);
    cloudinary.delete.mockResolvedValue(undefined);
    activityLog.execute.mockResolvedValue(undefined);
    getCurrentUser.execute.mockResolvedValue({
      id: 'staff-1',
      name: 'New Name',
    });

    module = await Test.createTestingModule({
      providers: [
        UpdateCurrentUserProfileService,
        { provide: PrismaService, useValue: prisma },
        { provide: CloudinaryService, useValue: cloudinary },
        { provide: CreateActivityLogService, useValue: activityLog },
        { provide: GetCurrentUserService, useValue: getCurrentUser },
      ],
    }).compile();

    service = module.get(UpdateCurrentUserProfileService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('rejects an empty profile update', async () => {
    await expect(service.execute('staff-1', {})).rejects.toThrow(
      'At least one profile field is required.',
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires avatar URL and public ID to be updated together', async () => {
    await expect(
      service.execute('staff-1', {
        avatar: 'https://res.cloudinary.com/demo/avatar.jpg',
      }),
    ).rejects.toThrow(
      'Avatar URL and Cloudinary public ID must be updated together.',
    );

    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('updates the authenticated user and writes the audit record in the transaction', async () => {
    const result = await service.execute('staff-1', {
      name: 'New Name',
      phone: '+8801712345678',
      avatar: updatedUser.avatar,
      publicId: updatedUser.publicId,
    });

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'staff-1', deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        publicId: true,
      },
    });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      data: {
        name: 'New Name',
        phone: '+8801712345678',
        avatar: updatedUser.avatar,
        publicId: updatedUser.publicId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        publicId: true,
      },
    });
    expect(activityLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE_OWN_PROFILE',
        userId: 'staff-1',
        entityId: 'staff-1',
      }),
      transaction,
    );
    expect(cloudinary.isUserAssetOwnedBy).toHaveBeenCalledWith(
      'staff-1',
      updatedUser.publicId,
    );
    expect(getCurrentUser.execute).toHaveBeenCalledWith('staff-1');
    expect(result).toEqual({ id: 'staff-1', name: 'New Name' });
  });

  it('rejects an avatar uploaded to another staff member folder', async () => {
    cloudinary.isUserAssetOwnedBy.mockReturnValue(false);

    await expect(
      service.execute('staff-1', {
        avatar: updatedUser.avatar,
        publicId: 'commerceos/users/staff-2/avatar',
      }),
    ).rejects.toThrow(
      'Profile avatars must be uploaded to your own account folder.',
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
