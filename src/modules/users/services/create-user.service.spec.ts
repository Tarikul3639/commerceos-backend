import { vi } from 'vitest';
vi.mock('../../../lib/prisma/client.js', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
vi.mock('../../../common/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));
vi.mock('../../../common/utils/password.util.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));
vi.mock('../../../common/mail/mail.service.js', () => ({
  MailService: class MailService {},
}));
vi.mock('../../activity-logs/services/create-activity-log.service.js', () => ({
  CreateActivityLogService: class CreateActivityLogService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Role } from '../../../lib/prisma/enums.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { MailService } from '../../../common/mail/mail.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { CreateUserService } from './create-user.service.js';
import { CreateUserDto } from '../dto/requests/create-user.dto.js';

describe('CreateUserService', () => {
  it('prevents ADMIN from creating another ADMIN account', async () => {
    const prisma = { user: { findUnique: vi.fn() } };
    const service = new CreateUserService(
      prisma as unknown as PrismaService,
      { getOrThrow: vi.fn() } as unknown as ConfigService,
      {} as MailService,
      {} as never,
      {} as CreateActivityLogService,
    );

    await expect(
      service.execute(
        { role: Role.ADMIN } as CreateUserDto,
        'admin-actor',
        Role.ADMIN,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('creates a password-setup token and emails an invitation link', async () => {
    const user = {
      id: 'employee-1',
      name: 'New Employee',
      email: 'employee@example.com',
      phone: null,
      avatar: null,
      publicId: null,
      role: Role.EMPLOYEE,
      status: 'ACTIVE',
      isVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const tx = {
      user: { create: vi.fn().mockResolvedValue(user) },
      userPasswordResetToken: { create: vi.fn().mockResolvedValue({}) },
    };
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn((callback: (transaction: never) => unknown) =>
        callback(tx as never),
      ),
    };
    const config = {
      getOrThrow: vi.fn((key: string) => {
        const values: Record<string, string | number> = {
          'bcrypt.saltRounds': 10,
          'auth.user.passwordResetExpiresIn': '30m',
          'app.frontendUrl': 'https://admin.example.com',
          'app.name': 'CommerceOS',
        };
        return values[key];
      }),
    };
    const mail = { sendWelcomeEmail: vi.fn() };
    const token = {
      generateRandomToken: vi.fn().mockReturnValue('setup-token'),
      hashToken: vi.fn().mockReturnValue('hashed-setup-token'),
    };
    const activity = { execute: vi.fn() };
    const service = new CreateUserService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      mail as unknown as MailService,
      token as never,
      activity as unknown as CreateActivityLogService,
    );

    await expect(
      service.execute(
        {
          name: 'New Employee',
          email: 'employee@example.com',
          role: Role.EMPLOYEE,
        },
        'admin-actor',
        Role.ADMIN,
      ),
    ).resolves.toMatchObject({
      id: 'employee-1',
      isVerified: false,
    });

    expect(tx.userPasswordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tokenHash: 'hashed-setup-token',
          userId: 'employee-1',
        }) as unknown as Record<string, unknown>,
      }),
    );
    expect(mail.sendWelcomeEmail).toHaveBeenCalledWith(
      'employee@example.com',
      expect.objectContaining({
        passwordSetupUrl:
          'https://admin.example.com/reset-password?token=setup-token',
      }),
    );
  });
});
