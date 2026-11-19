import { Global, Module } from '@nestjs/common';

import { ActivityLogController } from './controllers/activity-log.controller.js';

import { CreateActivityLogService } from './services/create-activity-log.service.js';
import { GetActivityLogService } from './services/get-activity-log.service.js';
import { GetActivityLogsService } from './services/get-activity-logs.service.js';

@Global()
@Module({
  controllers: [ActivityLogController],

  providers: [
    CreateActivityLogService,
    GetActivityLogService,
    GetActivityLogsService,
  ],

  exports: [
    CreateActivityLogService,
    GetActivityLogService,
    GetActivityLogsService,
  ],
})
export class ActivityLogModule {}
