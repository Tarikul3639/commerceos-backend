import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateActivityLogInput } from '../interfaces/activity-log.interface';

@Injectable()
export class CreateActivityLogService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(data: CreateActivityLogInput) {
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

                ...(data.ipAddress !== undefined && {
                    ipAddress: data.ipAddress,
                }),

                ...(data.userAgent !== undefined && {
                    userAgent: data.userAgent,
                }),

                ...(data.userId !== undefined && {
                    user: {
                        connect: {
                            id: data.userId,
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