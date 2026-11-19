import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import ms, { type StringValue } from 'ms';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/client.js';
import { Role } from '../../../infrastructure/database/generated/prisma/enums.js';
import { TokenService } from '../../auth/user/services/token.service.js';

import { CreateUserDto } from '../dto/requests/create-user.dto.js';
import { UserResponseDto } from '../dto/responses/user-response.dto.js';

import { EmailService } from '../../../infrastructure/messaging/email/email.service.js';
import { hashPassword } from '../../../common/utils/password.util.js';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: EmailService,
    private readonly tokenService: TokenService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /** Create a staff account and record the acting staff member. */
  async execute(
    createUserDto: CreateUserDto,
    requesterId: string,
    requesterRole: Role,
  ): Promise<UserResponseDto> {
    const { name, email, phone, avatar, publicId, role } = createUserDto;

    if ((avatar !== undefined) !== (publicId !== undefined)) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must be provided together',
      );
    }

    if (role === Role.ADMIN && requesterRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can create ADMIN accounts.',
      );
    }

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

    const setupToken = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(setupToken);
    const expireIn = this.configService.getOrThrow<StringValue>(
      'auth.user.passwordResetExpiresIn',
    );
    const expiresAt = new Date(Date.now() + ms(expireIn));

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role,
          ...(phone && { phone }),
          ...(avatar !== undefined && { avatar }),
          ...(publicId !== undefined && { publicId }),
        },
      });

      await tx.userPasswordResetToken.create({
        data: {
          tokenHash,
          expiresAt,
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    const frontendUrl =
      this.configService.getOrThrow<string>('app.frontendUrl');

    await this.mailService.sendWelcomeEmail(user.email, {
      appName: this.configService.getOrThrow<string>('app.name'),
      name: user.name,
      loginUrl: `${frontendUrl}/login`,
      passwordSetupUrl: `${frontendUrl}/reset-password?token=${setupToken}`,
      expireIn,
      year: new Date().getFullYear(),
    });

    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.USER,
      action: 'CREATE_USER',
      description: `User "${user.name}" was created with role ${user.role}`,
      entityType: 'User',
      entityId: user.id,
      userId: requesterId,
      newValue: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        publicId: user.publicId,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      publicId: user.publicId,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
