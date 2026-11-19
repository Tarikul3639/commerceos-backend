import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { Role } from '../../../lib/prisma/enums.js';

@Injectable()
export class DeleteUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Delete a staff account, preventing self-deletion and recording the actor.
   */
  async execute(
    userId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<void> {
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

    if (userId === requesterId) {
      throw new BadRequestException('You cannot delete your own account.');
    }

    // Privileged accounts can only be managed by SUPER_ADMIN.
    if (user.role === Role.ADMIN && requesterRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can delete ADMIN accounts.',
      );
    }

    // SUPER_ADMIN cannot be deleted
    if (user.role === Role.SUPER_ADMIN) {
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
      const deletedUser = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            status: 'DELETED',
            deletedAt: new Date(),
          },
        });

        await tx.userRefreshToken.updateMany({
          where: {
            userId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });

        await tx.userPasswordResetToken.deleteMany({
          where: { userId },
        });

        await tx.userEmailVerificationToken.deleteMany({
          where: { userId },
        });

        return updated;
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.USER,
        action: 'DELETE_USER',
        description: 'User was soft deleted',
        entityType: 'User',
        entityId: deletedUser.id,
        userId: requesterId,
        oldValue: {
          status: user.status,
          role: user.role,
          deletedAt: user.deletedAt,
        },
        newValue: {
          status: deletedUser.status,
          deletedAt: deletedUser.deletedAt,
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
      userId: requesterId,
      oldValue: {
        status: user.status,
        role: user.role,
        deletedAt: user.deletedAt,
      },
      newValue: '',
    });
  }
}
