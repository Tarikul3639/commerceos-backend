import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';
import { UpdateNotificationPreferencesDto } from '../dto/requests/update-notification-preferences.dto';
import { NotificationPreferencesResponseDto } from '../dto/responses/notification-preferences-response.dto';
import { NotificationPreferencesService } from '../services/notification-preferences.service';

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
  update(@Body() dto: UpdateNotificationPreferencesDto) {
    return this.preferences.update(dto);
  }
}
