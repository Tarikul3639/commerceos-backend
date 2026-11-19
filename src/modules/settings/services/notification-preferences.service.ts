import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/enums.js';
import { UpdateNotificationPreferencesDto } from '../dto/requests/update-notification-preferences.dto.js';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: CreateActivityLogService,
  ) {}

  async get() {
    return this.prisma.notificationPreferences.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });
  }

  async update(dto: UpdateNotificationPreferencesDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.notificationPreferences.findUnique({
        where: { id: 'default' },
      });
      const saved = await tx.notificationPreferences.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...dto },
        update: dto,
      });

      await this.activityLog.execute(
        {
          type: previous ? ActivityType.UPDATE : ActivityType.CREATE,
          module: ActivityModule.SETTINGS,
          action: 'UPDATE_NOTIFICATION_PREFERENCES',
          description: 'Notification preferences changed',
          entityType: 'NotificationPreferences',
          entityId: saved.id,
          userId,
          ...(previous
            ? { oldValue: previous, newValue: saved }
            : { newValue: saved }),
        },
        tx,
      );

      return saved;
    });
  }
}
