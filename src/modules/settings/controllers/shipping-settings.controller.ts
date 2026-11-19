import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { Permission } from '../../../lib/prisma/enums.js';
import { CreateShippingZoneDto } from '../dto/requests/create-shipping-zone.dto.js';
import { UpdateShippingZoneDto } from '../dto/requests/update-shipping-zone.dto.js';
import { UpdateShippingSettingsDto } from '../dto/requests/update-shipping-settings.dto.js';
import {
  ShippingSettingsResponseDto,
  ShippingZoneResponseDto,
} from '../dto/responses/shipping-settings-response.dto.js';
import { ShippingSettingsService } from '../services/shipping-settings.service.js';

@ApiTags('Shipping Settings')
@ApiBearerAuth()
@Controller('shipping-settings')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class ShippingSettingsController {
  constructor(private readonly shipping: ShippingSettingsService) {}

  @Get()
  @Permissions(Permission.SETTING_READ)
  @ApiOkResponse({ type: ShippingSettingsResponseDto })
  getSettings() {
    return this.shipping.getSettings();
  }

  @Patch()
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOkResponse({ description: 'Updated free-shipping threshold' })
  updateSettings(
    @Body() dto: UpdateShippingSettingsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shipping.updateSettings(dto, userId);
  }

  @Post('zones')
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOkResponse({ type: ShippingZoneResponseDto })
  createZone(
    @Body() dto: CreateShippingZoneDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shipping.createZone(dto, userId);
  }

  @Patch('zones/:id')
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOkResponse({ type: ShippingZoneResponseDto })
  updateZone(
    @Param('id') id: string,
    @Body() dto: UpdateShippingZoneDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.shipping.updateZone(id, dto, userId);
  }

  @Delete('zones/:id')
  @Permissions(Permission.SETTING_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  deleteZone(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.shipping.deleteZone(id, userId);
  }
}
