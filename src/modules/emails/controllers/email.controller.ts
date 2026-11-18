import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/client';
import { EmailLogQueryDto } from '../dto/requests/email-log-query.dto';
import { EmailLogService } from '../services/email-log.service';

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
