import {
    ActivityModule,
    ActivityType,
    Prisma,
} from '@/lib/prisma/client';

export interface CreateActivityLogInput {
    type: ActivityType;
    module: ActivityModule;
    action: string;

    description?: string;

    entityType?: string;
    entityId?: string;

    oldValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;

    ipAddress?: string;
    userAgent?: string;
    userId?: string;
}