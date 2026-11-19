import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/lib/prisma/enums';

import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UpdateSettingsDto } from '../dto/requests/update-settings.dto';
import { SettingsResponseDto } from '../dto/responses/settings-response.dto';

import { GetSettingsService } from '../services/get-settings.service';
import { UpdateSettingsService } from '../services/update-settings.service';

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
