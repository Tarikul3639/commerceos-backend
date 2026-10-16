import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { CreateUserDto } from '../dto/requests/create-user.dto';
import { UserResponseDto } from '../dto/responses/user-response.dto';

import { MailService } from '@/common/mail/mail.service';
import { hashPassword } from '@/common/utils/password.util';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { name, email, phone, avatar, role } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (phone) {
      const existingPhoneUser = await this.prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (existingPhoneUser) {
        throw new ConflictException(
          'User with this phone number already exists',
        );
      }
    }

    // Generate secure random password
    const temporaryPassword = randomBytes(32).toString('base64url');

    // Hash password before storing
    const passwordHash = await hashPassword(
      temporaryPassword,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        ...(phone && { phone }),
        ...(avatar && { avatar }),
      },
    });

    const frontendUrl =
      this.configService.getOrThrow<string>('app.frontendUrl');

    await this.mailService.sendWelcomeEmail(user.email, {
      appName: this.configService.getOrThrow<string>('app.name'),
      name: user.name,
      loginUrl: `${frontendUrl}/login`,
      year: new Date().getFullYear(),
    });

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.USER,
      action: 'CREATE_USER',
      description: `User "${user.name}" was created with role ${user.role}`,
      entityType: 'User',
      entityId: user.id,
      newValue: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
