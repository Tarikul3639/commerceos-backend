import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { UserResponseDto } from '../dto/responses/user-response.dto.js';
import {
  Role,
  UserStatus,
} from '../../../infrastructure/database/generated/prisma/enums.js';

@Injectable()
export class RestoreUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        isVerified: true,
        deletedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException('SUPER_ADMIN user cannot be restored');
    }

    if (user.status !== UserStatus.DELETED) {
      throw new BadRequestException('Only deleted users can be restored');
    }

    const restoredUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.STATUS_CHANGE,
      module: ActivityModule.USER,
      action: 'RESTORE_USER',
      description: `User restored from ${user.status} to ${restoredUser.status}`,
      entityType: 'User',
      entityId: restoredUser.id,
      oldValue: {
        status: user.status,
        deletedAt: user.deletedAt,
      },
      newValue: {
        status: restoredUser.status,
        deletedAt: restoredUser.deletedAt,
      },
    });

    return {
      id: restoredUser.id,
      name: restoredUser.name,
      email: restoredUser.email,
      phone: restoredUser.phone,
      avatar: restoredUser.avatar,
      role: restoredUser.role,
      status: restoredUser.status,
      isVerified: restoredUser.isVerified,
      lastLoginAt: restoredUser.lastLoginAt,
      createdAt: restoredUser.createdAt,
      updatedAt: restoredUser.updatedAt,
    };
  }
}
