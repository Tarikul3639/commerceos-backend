import { Module } from '@nestjs/common';

import { NotificationController } from '@/modules/notifications/controllers/notification.controller';

import { CreateNotificationService } from '@/modules/notifications/services/create-notification.service';
import { DeleteNotificationService } from '@/modules/notifications/services/delete-notification.service';
import { GetNotificationService } from '@/modules/notifications/services/get-notification.service';
import { GetNotificationsService } from '@/modules/notifications/services/get-notifications.service';
import { MarkAllNotificationsReadService } from '@/modules/notifications/services/mark-all-notifications-read.service';
import { MarkNotificationReadService } from '@/modules/notifications/services/mark-notification-read.service';

@Module({
  controllers: [NotificationController],
  providers: [
    CreateNotificationService,
    DeleteNotificationService,
    GetNotificationService,
    GetNotificationsService,
    MarkAllNotificationsReadService,
    MarkNotificationReadService,
  ],
  exports: [
    CreateNotificationService,
    DeleteNotificationService,
    GetNotificationService,
    GetNotificationsService,
    MarkAllNotificationsReadService,
    MarkNotificationReadService,
  ],
})
export class NotificationModule {}
