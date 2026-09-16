import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { DashboardQueryDto } from '../dto/requests/dashboard-query.dto';
import { RecentActivitiesResponseDto } from '../dto/responses/recent-activities-response.dto';

@Injectable()
export class GetRecentActivitiesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        _query: DashboardQueryDto,
    ): Promise<RecentActivitiesResponseDto> {
        /**
         * Get the latest activity logs.
         *
         * Only the fields required for the
         * dashboard response are selected.
         */
        const logs = await this.prisma.activityLog.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                type: true,
                module: true,
                action: true,
                description: true,
                entityType: true,
                entityId: true,
                userId: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        /**
         * Transform activity logs into
         * the dashboard response format.
         */
        return {
            data: logs.map((log) => ({
                id: log.id,
                type: log.type,
                module: log.module,
                action: log.action,
                description: log.description,
                entityType: log.entityType,
                entityId: log.entityId,
                userId: log.userId,
                user: log.user
                    ? {
                        id: log.user.id,
                        name: log.user.name,
                        email: log.user.email,
                        avatar: log.user.avatar ?? null,
                    }
                    : null,
                createdAt: log.createdAt,
            })),
        };
    }
}
