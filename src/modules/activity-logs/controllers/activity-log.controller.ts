import { Controller, Get, Param, Query } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActivityLogQueryDto } from '@/modules/activity-logs/dto/requests/activity-log-query.dto';
import { GetActivityLogService } from '@/modules/activity-logs/services/get-activity-log.service';
import { GetActivityLogsService } from '@/modules/activity-logs/services/get-activity-logs.service';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogController {
  constructor(
    private readonly getActivityLogService: GetActivityLogService,
    private readonly getActivityLogsService: GetActivityLogsService,
  ) {}

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
