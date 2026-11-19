import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';

import { ActivityLogQueryDto } from '../dto/requests/activity-log-query.dto.js';
import { GetActivityLogService } from '../services/get-activity-log.service.js';
import { GetActivityLogsService } from '../services/get-activity-logs.service.js';

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
