import { Module } from '@nestjs/common';

import { NotificationController } from './controllers/notification.controller';

import { CreateNotificationService } from './services/create-notification.service';
import { DeleteNotificationService } from './services/delete-notification.service';
import { GetNotificationService } from './services/get-notification.service';
import { GetNotificationsService } from './services/get-notifications.service';
import { MarkAllNotificationsReadService } from './services/mark-all-notifications-read.service';
import { MarkNotificationReadService } from './services/mark-notification-read.service';

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