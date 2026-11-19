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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Permission } from '@/lib/prisma/enums';
import { CreateShippingZoneDto } from '../dto/requests/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from '../dto/requests/update-shipping-zone.dto';
import { UpdateShippingSettingsDto } from '../dto/requests/update-shipping-settings.dto';
import {
  ShippingSettingsResponseDto,
  ShippingZoneResponseDto,
} from '../dto/responses/shipping-settings-response.dto';
import { ShippingSettingsService } from '../services/shipping-settings.service';

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
  updateSettings(@Body() dto: UpdateShippingSettingsDto) {
    return this.shipping.updateSettings(dto);
  }

  @Post('zones')
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOkResponse({ type: ShippingZoneResponseDto })
  createZone(@Body() dto: CreateShippingZoneDto) {
    return this.shipping.createZone(dto);
  }

  @Patch('zones/:id')
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOkResponse({ type: ShippingZoneResponseDto })
  updateZone(@Param('id') id: string, @Body() dto: UpdateShippingZoneDto) {
    return this.shipping.updateZone(id, dto);
  }

  @Delete('zones/:id')
  @Permissions(Permission.SETTING_UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  deleteZone(@Param('id') id: string) {
    return this.shipping.deleteZone(id);
  }
}
