import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

import { NotificationResponseDto } from '../dto/responses/notification-response.dto';

@Injectable()
export class MarkNotificationReadService {
    constructor(private readonly prisma: PrismaService) {}

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

        return this.prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                isRead: true,
            },
        });
    }
}