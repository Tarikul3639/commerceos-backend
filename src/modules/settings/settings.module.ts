import { Module } from '@nestjs/common';

import { SettingsController } from '@/modules/settings/controllers/settings.controller';

// Services
import { GetSettingsService } from '@/modules/settings/services/get-settings.service';
import { UpdateSettingsService } from '@/modules/settings/services/update-settings.service';

@Module({
  controllers: [SettingsController],
  providers: [GetSettingsService, UpdateSettingsService],
  exports: [GetSettingsService, UpdateSettingsService],
})
export class SettingsModule {}
