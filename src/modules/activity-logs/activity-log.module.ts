import { Module } from '@nestjs/common';

import { ActivityLogController } from './controllers/activity-log.controller';

import { CreateActivityLogService } from './services/create-activity-log.service';
import { GetActivityLogService } from './services/get-activity-log.service';
import { GetActivityLogsService } from './services/get-activity-logs.service';

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
export class ActivityLogModule { }
