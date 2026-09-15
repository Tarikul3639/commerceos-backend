import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationResponseDto } from '../dto/responses/notification-response.dto';
import { NotificationType } from '@/lib/prisma/client';

@Injectable()
export class CreateNotificationService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(data: {
        userId: string;
        title: string;
        message: string;
        type?: NotificationType;
        link?: string;
        entityType?: string;
        entityId?: string;
    }): Promise<NotificationResponseDto> {
        const notification = await this.prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                ...(data.type !== undefined && {
                    type: data.type,
                }),
                ...(data.link !== undefined && {
                    link: data.link,
                }),
                ...(data.entityType !== undefined && {
                    entityType: data.entityType,
                }),
                ...(data.entityId !== undefined && {
                    entityId: data.entityId,
                }),
            },
        });

        return notification;
    }
}
