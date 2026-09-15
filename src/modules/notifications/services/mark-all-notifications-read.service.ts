import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class MarkAllNotificationsReadService {
    constructor(private readonly prisma: PrismaService) {}

    async execute(userId: string) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return {
            updatedCount: result.count,
        };
    }
}