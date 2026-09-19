import {
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { NotificationQueryDto } from '../dto/requests/notification-query.dto';

import { DeleteNotificationService } from '../services/delete-notification.service';
import { GetNotificationService } from '../services/get-notification.service';
import { GetNotificationsService } from '../services/get-notifications.service';
import { MarkAllNotificationsReadService } from '../services/mark-all-notifications-read.service';
import { MarkNotificationReadService } from '../services/mark-notification-read.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly getNotificationService: GetNotificationService,
        private readonly getNotificationsService: GetNotificationsService,
        private readonly markNotificationReadService: MarkNotificationReadService,
        private readonly markAllNotificationsReadService: MarkAllNotificationsReadService,
        private readonly deleteNotificationService: DeleteNotificationService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Get user notifications',
    })
    findAll(
        @Query() query: NotificationQueryDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.getNotificationsService.execute(
            userId,
            query,
        );
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get notification',
    })
    findOne(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.getNotificationService.execute(
            id,
            userId,
        );
    }

    @Patch('read-all')
    @ApiOperation({
        summary: 'Mark all notifications as read',
    })
    markAllAsRead(
        @CurrentUser('id') userId: string,
    ) {
        return this.markAllNotificationsReadService.execute(
            userId,
        );
    }

    @Patch(':id/read')
    @ApiOperation({
        summary: 'Mark notification as read',
    })
    markAsRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.markNotificationReadService.execute(
            id,
            userId,
        );
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Delete notification',
    })
    remove(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.deleteNotificationService.execute(
            id,
            userId,
        );
    }
}