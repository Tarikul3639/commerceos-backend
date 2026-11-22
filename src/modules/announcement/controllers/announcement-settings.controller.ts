import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';

import { UpdateAnnouncementSettingsDto } from '../dto/requests/update-announcement-settings.dto.js';
import { AnnouncementSettingsResponseDto } from '../dto/responses/announcement-settings-response.dto.js';
import { AnnouncementSettingsService } from '../services/announcement-settings.service.js';

@ApiTags('Announcement Settings')
@Controller('settings/announcement')
export class AnnouncementSettingsController {
  constructor(private readonly announcement: AnnouncementSettingsService) {}

  @Get('storefront')
  @ApiOperation({ summary: 'Get the active storefront announcement' })
  @ApiOkResponse({ description: 'Active announcement, or null when disabled' })
  getStorefront() {
    return this.announcement.getStorefront();
  }

  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SETTING_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get announcement settings' })
  @ApiOkResponse({ type: AnnouncementSettingsResponseDto })
  get() {
    return this.announcement.get();
  }

  @Patch()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SETTING_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update announcement settings' })
  @ApiOkResponse({ type: AnnouncementSettingsResponseDto })
  update(@Body() dto: UpdateAnnouncementSettingsDto) {
    return this.announcement.update(dto);
  }
}
