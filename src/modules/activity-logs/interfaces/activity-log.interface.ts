import {
  ActivityModule,
  ActivityType,
  Prisma,
} from '../../../infrastructure/database/generated/prisma/client.js';

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
