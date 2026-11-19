import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/client.js';
import { EmailLogQueryDto } from '../dto/requests/email-log-query.dto.js';
import { EmailLogService } from '../services/email-log.service.js';

@ApiTags('Emails')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Permissions(Permission.EMAIL_READ)
@Controller('emails')
export class EmailController {
  constructor(private readonly emailLogService: EmailLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated email delivery logs' })
  findAll(@Query() query: EmailLogQueryDto) {
    return this.emailLogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email delivery log details' })
  findOne(@Param('id') id: string) {
    return this.emailLogService.findById(id);
  }
}
