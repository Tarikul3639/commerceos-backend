import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UpdateSettingsDto } from '../dto/requests/update-settings.dto.js';
import { SettingsResponseDto } from '../dto/responses/settings-response.dto.js';

import { GetSettingsService } from '../services/get-settings.service.js';
import { UpdateSettingsService } from '../services/update-settings.service.js';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(
    private readonly getSettingsService: GetSettingsService,
    private readonly updateSettingsService: UpdateSettingsService,
  ) {}

  @Get()
  @Permissions(Permission.SETTING_READ)
  @ApiOperation({
    summary: 'Get application settings',
  })
  @ApiOkResponse({
    type: SettingsResponseDto,
  })
  async get(): Promise<SettingsResponseDto | null> {
    return this.getSettingsService.execute();
  }

  @Patch()
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOperation({
    summary: 'Update application settings',
  })
  @ApiOkResponse({
    type: SettingsResponseDto,
  })
  async update(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @CurrentUser('id') userId: string,
  ): Promise<SettingsResponseDto> {
    return this.updateSettingsService.execute(updateSettingsDto, userId);
  }
}
