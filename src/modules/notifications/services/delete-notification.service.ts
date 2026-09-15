import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class DeleteNotificationService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        notificationId: string,
        userId: string,
    ): Promise<void> {
        const notification = await this.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        await this.prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });
    }
}