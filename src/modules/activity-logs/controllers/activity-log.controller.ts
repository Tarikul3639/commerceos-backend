import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/lib/prisma/enums';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

import { ActivityLogQueryDto } from '../dto/requests/activity-log-query.dto';
import { GetActivityLogService } from '../services/get-activity-log.service';
import { GetActivityLogsService } from '../services/get-activity-logs.service';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Permissions(Permission.ACTIVITY_LOG_READ)
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
