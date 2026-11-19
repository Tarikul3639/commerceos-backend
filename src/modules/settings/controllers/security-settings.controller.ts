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
import { UpdateSecuritySettingsDto } from '../dto/requests/update-security-settings.dto';
import { SecuritySettingsResponseDto } from '../dto/responses/security-settings-response.dto';
import { SecuritySettingsService } from '../services/security-settings.service';

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
  update(@Body() dto: UpdateSecuritySettingsDto) {
    return this.securitySettings.update(dto);
  }
}
