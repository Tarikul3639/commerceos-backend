import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';
import { UpdateNotificationPreferencesDto } from '../dto/requests/update-notification-preferences.dto.js';
import { NotificationPreferencesResponseDto } from '../dto/responses/notification-preferences-response.dto.js';
import { NotificationPreferencesService } from '../services/notification-preferences.service.js';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@Controller('settings/notification-preferences')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class NotificationPreferencesController {
  constructor(private readonly preferences: NotificationPreferencesService) {}

  @Get()
  @Permissions(Permission.SETTING_READ)
  @ApiOperation({ summary: 'Get store notification preferences' })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  get() {
    return this.preferences.get();
  }

  @Patch()
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOperation({ summary: 'Update store notification preferences' })
  @ApiOkResponse({ type: NotificationPreferencesResponseDto })
  update(
    @Body() dto: UpdateNotificationPreferencesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.preferences.update(dto, userId);
  }
}
