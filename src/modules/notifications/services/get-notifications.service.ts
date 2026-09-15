import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { NotificationQueryDto } from '../dto/requests/notification-query.dto';
import { NotificationPaginationResponseDto } from '../dto/responses/notification-response.dto';

@Injectable()
export class GetNotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        userId: string,
        query: NotificationQueryDto,
    ): Promise<NotificationPaginationResponseDto> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        const where = {
            userId,
            ...(query.type !== undefined && {
                type: query.type,
            }),
            ...(query.isRead !== undefined && {
                isRead: query.isRead === 'true',
            }),
        };

        const [notifications, total, unreadCount] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),

            this.prisma.notification.count({
                where,
            }),

            this.prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            }),
        ]);

        return {
    data: notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        link: notification.link,
        entityType: notification.entityType,
        entityId: notification.entityId,
        userId: notification.userId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
    })),
    meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
    },
};
    }
}
