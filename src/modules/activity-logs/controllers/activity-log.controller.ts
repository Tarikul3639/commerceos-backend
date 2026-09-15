import { Controller, Get, Param, Query } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActivityLogQueryDto } from '../dto/requests/activity-log-query.dto';
import { GetActivityLogService } from '../services/get-activity-log.service';
import { GetActivityLogsService } from '../services/get-activity-logs.service';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogController {
    constructor(
        private readonly getActivityLogService: GetActivityLogService,
        private readonly getActivityLogsService: GetActivityLogsService,
    ) { }

    @Get()
    @ApiOperation({
        summary: 'Get activity logs',
    })
    findAll(@Query() query: ActivityLogQueryDto) {
        return this.getActivityLogsService.execute(query);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get activity log by ID',
    })
    findOne(@Param('id') id: string) {
        return this.getActivityLogService.execute(id);
    }
}
