import { Module } from '@nestjs/common';

import { NotificationController } from './controllers/notification.controller.js';

import { CreateNotificationService } from './services/create-notification.service.js';
import { DeleteNotificationService } from './services/delete-notification.service.js';
import { GetNotificationService } from './services/get-notification.service.js';
import { GetNotificationsService } from './services/get-notifications.service.js';
import { MarkAllNotificationsReadService } from './services/mark-all-notifications-read.service.js';
import { MarkNotificationReadService } from './services/mark-notification-read.service.js';

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
