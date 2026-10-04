import { Module } from '@nestjs/common';

import { ActivityLogController } from '@/modules/activity-logs/controllers/activity-log.controller';

import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { GetActivityLogService } from '@/modules/activity-logs/services/get-activity-log.service';
import { GetActivityLogsService } from '@/modules/activity-logs/services/get-activity-logs.service';

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
