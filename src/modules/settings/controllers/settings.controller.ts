import { Body, Controller, Get, Patch } from '@nestjs/common';

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
export class SettingsController {
    constructor(
        private readonly getSettingsService: GetSettingsService,
        private readonly updateSettingsService: UpdateSettingsService,
    ) { }

    @Get()
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
    @ApiOperation({
        summary: 'Update application settings',
    })
    @ApiOkResponse({
        type: SettingsResponseDto,
    })
    async update(
        @Body() updateSettingsDto: UpdateSettingsDto,
    ): Promise<SettingsResponseDto> {
        return this.updateSettingsService.execute(updateSettingsDto);
    }
}
