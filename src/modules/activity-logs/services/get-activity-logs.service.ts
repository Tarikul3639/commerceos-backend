import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { ActivityLogQueryDto } from '../dto/requests/activity-log-query.dto';
import { ActivityLogResponseDto } from '../dto/responses/activity-log-response.dto';

@Injectable()
export class GetActivityLogsService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        query: ActivityLogQueryDto,
    ): Promise<{
        data: ActivityLogResponseDto[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;

        const skip = (page - 1) * limit;

        const where = {
            ...(query.type !== undefined && {
                type: query.type,
            }),

            ...(query.module !== undefined && {
                module: query.module,
            }),

            ...(query.action !== undefined && {
                action: {
                    contains: query.action,
                    mode: 'insensitive' as const,
                },
            }),

            ...(query.entityType !== undefined && {
                entityType: query.entityType,
            }),

            ...(query.entityId !== undefined && {
                entityId: query.entityId,
            }),

            ...(query.userId !== undefined && {
                userId: query.userId,
            }),

            ...(query.search !== undefined && {
                OR: [
                    {
                        action: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        description: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        entityType: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        entityId: {
                            contains: query.search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        user: {
                            name: {
                                contains: query.search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: query.search,
                                mode: 'insensitive' as const,
                            },
                        },
                    },
                ],
            }),
        };

        const [logs, total] =
            await this.prisma.$transaction([
                this.prisma.activityLog.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc',
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
                }),

                this.prisma.activityLog.count({
                    where,
                }),
            ]);

        const totalPages = Math.ceil(
            total / limit,
        );

        const data: ActivityLogResponseDto[] =
            logs.map((log) => ({
                id: log.id,
                type: log.type,
                module: log.module,
                action: log.action,
                description: log.description,
                entityType: log.entityType,
                entityId: log.entityId,
                oldValue: log.oldValue,
                newValue: log.newValue,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                userId: log.userId,

                user: log.user
                    ? {
                          id: log.user.id,
                          name: log.user.name,
                          email: log.user.email,
                      }
                    : null,

                createdAt: log.createdAt,
            }));

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}