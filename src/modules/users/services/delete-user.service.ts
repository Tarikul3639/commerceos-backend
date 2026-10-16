import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        status: true,
        role: true,
        deletedAt: true,

        _count: {
          select: {
            refreshTokens: true,
            passwordResetTokens: true,
            emailVerificationTokens: true,

            orders: true,
            purchases: true,
            payments: true,

            createdOrderReturns: true,
            approvedOrderReturns: true,

            createdPurchaseReturns: true,
            approvedPurchaseReturns: true,

            activityLogs: true,
            notifications: true,
            triggeredEmails: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // SUPER_ADMIN cannot be deleted
    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('SUPER_ADMIN user cannot be deleted');
    }

    // Already deleted
    if (user.status === 'DELETED') {
      throw new ForbiddenException('User is already deleted');
    }

    // Check if the user has any relations
    const hasRelations = Object.values(user._count).some((count) => count > 0);

    /**
     * If the user has relations, use soft delete.
     */
    if (hasRelations) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      return;
    }

    /**
     * If the user has no relations,
     * permanently delete the user.
     */
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.USER,
      action: 'DELETE_USER',
      description: 'User was permanently deleted',
      entityType: 'User',
      entityId: userId,
      oldValue: {
        status: user.status,
        role: user.role,
        deletedAt: user.deletedAt,
      },
      newValue: '',
    });
  }
}
