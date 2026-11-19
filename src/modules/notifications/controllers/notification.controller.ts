import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { Permission } from '../../../lib/prisma/enums.js';

import { NotificationQueryDto } from '../dto/requests/notification-query.dto.js';

import { DeleteNotificationService } from '../services/delete-notification.service.js';
import { GetNotificationService } from '../services/get-notification.service.js';
import { GetNotificationsService } from '../services/get-notifications.service.js';
import { MarkAllNotificationsReadService } from '../services/mark-all-notifications-read.service.js';
import { MarkNotificationReadService } from '../services/mark-notification-read.service.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationService: GetNotificationService,
    private readonly getNotificationsService: GetNotificationsService,
    private readonly markNotificationReadService: MarkNotificationReadService,
    private readonly markAllNotificationsReadService: MarkAllNotificationsReadService,
    private readonly deleteNotificationService: DeleteNotificationService,
  ) {}

  @Get()
  @Permissions(Permission.NOTIFICATION_READ)
  @ApiOperation({
    summary: 'Get user notifications',
  })
  findAll(
    @Query() query: NotificationQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.getNotificationsService.execute(userId, query);
  }

  @Get(':id')
  @Permissions(Permission.NOTIFICATION_READ)
  @ApiOperation({
    summary: 'Get notification',
  })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.getNotificationService.execute(id, userId);
  }

  @Patch('read-all')
  @Permissions(Permission.NOTIFICATION_UPDATE)
  @ApiOperation({
    summary: 'Mark all notifications as read',
  })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.markAllNotificationsReadService.execute(userId);
  }

  @Patch(':id/read')
  @Permissions(Permission.NOTIFICATION_UPDATE)
  @ApiOperation({
    summary: 'Mark notification as read',
  })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.markNotificationReadService.execute(id, userId);
  }

  @Delete(':id')
  @Permissions(Permission.NOTIFICATION_DELETE)
  @ApiOperation({
    summary: 'Delete notification',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.deleteNotificationService.execute(id, userId);
  }
}
