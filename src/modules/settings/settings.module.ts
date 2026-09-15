import { Module } from '@nestjs/common';

import { SettingsController } from './controllers/settings.controller';

// Services
import { GetSettingsService } from './services/get-settings.service';
import { UpdateSettingsService } from './services/update-settings.service';

@Module({
    controllers: [SettingsController],
    providers: [GetSettingsService, UpdateSettingsService],
    exports: [GetSettingsService, UpdateSettingsService],
})
export class SettingsModule { }
