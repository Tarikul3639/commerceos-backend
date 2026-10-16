import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { AuditContextService } from '@/common/audit/audit-context.service';
import { CreateActivityLogInput } from '../interfaces/activity-log.interface';

@Injectable()
export class CreateActivityLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditContext: AuditContextService,
  ) {}

  async execute(data: CreateActivityLogInput) {
    const context = this.auditContext.get();

    return this.prisma.activityLog.create({
      data: {
        type: data.type,
        module: data.module,
        action: data.action,

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.entityType !== undefined && {
          entityType: data.entityType,
        }),

        ...(data.entityId !== undefined && {
          entityId: data.entityId,
        }),

        ...(data.oldValue !== undefined && {
          oldValue: data.oldValue,
        }),

        ...(data.newValue !== undefined && {
          newValue: data.newValue,
        }),

        ...((data.ipAddress ?? context?.ipAddress) !== undefined && {
          ipAddress: (data.ipAddress ?? context?.ipAddress)!,
        }),

        ...((data.userAgent ?? context?.userAgent) !== undefined && {
          userAgent: (data.userAgent ?? context?.userAgent)!,
        }),

        ...((data.userId ?? context?.userId) !== undefined && {
          user: {
            connect: {
              id: (data.userId ?? context?.userId)!,
            },
          },
        }),
      },
    });
  }
}

/**
 * Example usage of CreateActivityLogService in a service method:
 *
 * await this.createActivityLogService.execute({
 *     type: ActivityType.CREATE,
 *     module: ActivityModule.EMPLOYEE,
 *     action: 'CREATE_EMPLOYEE',
 *     description: `Employee ${employee.id} created`,
 *     entityType: 'Employee',
 *     entityId: employee.id,
 *     newValue: {
 *         designation: employee.designation,
 *         userId: employee.userId,
 *     },
 *     userId: currentUserId,
 * });
 */
