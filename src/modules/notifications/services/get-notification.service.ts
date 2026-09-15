import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationResponseDto } from '../dto/responses/notification-response.dto';

@Injectable()
export class GetNotificationService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        notificationId: string,
        userId: string,
    ): Promise<NotificationResponseDto> {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        return notification;
    }
}
