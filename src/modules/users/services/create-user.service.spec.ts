jest.mock('@/lib/prisma/client', () => ({
  ActivityModule: { USER: 'USER' },
  ActivityType: { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' },
}));
jest.mock('@/common/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('@/common/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));
jest.mock('@/common/mail/mail.service', () => ({
  MailService: class MailService {},
}));
jest.mock(
  '@/modules/activity-logs/services/create-activity-log.service',
  () => ({
    CreateActivityLogService: class CreateActivityLogService {},
  }),
);

import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Role } from '@/lib/prisma/enums';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '@/common/mail/mail.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { CreateUserService } from './create-user.service';
import { CreateUserDto } from '../dto/requests/create-user.dto';

describe('CreateUserService', () => {
  it('prevents ADMIN from creating another ADMIN account', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    const service = new CreateUserService(
      prisma as unknown as PrismaService,
      { getOrThrow: jest.fn() } as unknown as ConfigService,
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
      user: { create: jest.fn().mockResolvedValue(user) },
      userPasswordResetToken: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const config = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          'bcrypt.saltRounds': 10,
          'auth.user.passwordResetExpiresIn': '30m',
          'app.frontendUrl': 'https://admin.example.com',
          'app.name': 'CommerceOS',
        };
        return values[key];
      }),
    };
    const mail = { sendWelcomeEmail: jest.fn() };
    const token = {
      generateRandomToken: jest.fn().mockReturnValue('setup-token'),
      hashToken: jest.fn().mockReturnValue('hashed-setup-token'),
    };
    const activity = { execute: jest.fn() };
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
        } as CreateUserDto,
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
        }),
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
