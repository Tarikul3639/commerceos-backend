import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

import { EmailStatus } from '@/lib/prisma/client';

@Injectable()
export class EmailLogService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: {
        to: string;
        subject: string;
        body: string;
        entityType?: string;
        entityId?: string;
        triggeredById?: string;
    }) {
        return this.prisma.emailLog.create({
            data: {
                to: data.to,
                subject: data.subject,
                body: data.body,

                ...(data.entityType !== undefined && {
                    entityType: data.entityType,
                }),

                ...(data.entityId !== undefined && {
                    entityId: data.entityId,
                }),

                ...(data.triggeredById !== undefined && {
                    triggeredById: data.triggeredById,
                }),
            },
        });
    }

    async markSending(id: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.PENDING,
                attemptCount: {
                    increment: 1,
                },
            },
        });
    }

    async markSent(id: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.SENT,
                sentAt: new Date(),
                errorMessage: null,
            },
        });
    }

    async markFailed(id: string, errorMessage: string) {
        return this.prisma.emailLog.update({
            where: {
                id,
            },
            data: {
                status: EmailStatus.FAILED,
                errorMessage,
            },
        });
    }

    async findById(id: string) {
        return this.prisma.emailLog.findUniqueOrThrow({
            where: {
                id,
            },
        });
    }
}
