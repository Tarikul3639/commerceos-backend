import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infrastructure/database/database.module.js';

import { AnnouncementSettingsController } from './controllers/announcement-settings.controller.js';
import { AnnouncementSettingsService } from './services/announcement-settings.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AnnouncementSettingsController],
  providers: [AnnouncementSettingsService],
})
export class AnnouncementModule {}
