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
import { Permission } from '../../../lib/prisma/enums.js';
import { UpdateSecuritySettingsDto } from '../dto/requests/update-security-settings.dto.js';
import { SecuritySettingsResponseDto } from '../dto/responses/security-settings-response.dto.js';
import { SecuritySettingsService } from '../services/security-settings.service.js';

@ApiTags('Security Settings')
@ApiBearerAuth()
@Controller('settings/security')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class SecuritySettingsController {
  constructor(private readonly securitySettings: SecuritySettingsService) {}

  @Get()
  @Permissions(Permission.SETTING_READ)
  @ApiOperation({ summary: 'Get security policy settings' })
  @ApiOkResponse({ type: SecuritySettingsResponseDto })
  get() {
    return this.securitySettings.get();
  }

  @Patch()
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOperation({ summary: 'Update security policy settings' })
  @ApiOkResponse({ type: SecuritySettingsResponseDto })
  update(
    @Body() dto: UpdateSecuritySettingsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.securitySettings.update(dto, userId);
  }
}
