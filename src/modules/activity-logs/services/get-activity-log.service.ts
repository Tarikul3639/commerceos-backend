import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { ActivityLogResponseDto } from '../dto/responses/activity-log-response.dto';

@Injectable()
export class GetActivityLogService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        id: string,
    ): Promise<ActivityLogResponseDto> {
        const activityLog =
            await this.prisma.activityLog.findUnique({
                where: {
                    id,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

        if (!activityLog) {
            throw new NotFoundException(
                'Activity log not found',
            );
        }

        return {
            id: activityLog.id,
            type: activityLog.type,
            module: activityLog.module,
            action: activityLog.action,
            description: activityLog.description,
            entityType: activityLog.entityType,
            entityId: activityLog.entityId,
            oldValue: activityLog.oldValue,
            newValue: activityLog.newValue,
            ipAddress: activityLog.ipAddress,
            userAgent: activityLog.userAgent,
            userId: activityLog.userId,

            user: activityLog.user
                ? {
                      id: activityLog.user.id,
                      name: activityLog.user.name,
                      email: activityLog.user.email,
                  }
                : null,

            createdAt: activityLog.createdAt,
        };
    }
}