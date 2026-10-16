import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';
import { CreateRefundDto } from '../dto/requests/create-refund.dto';
import { RefundResponseDto } from '../dto/responses/refund-response.dto';
import { CreateRefundService } from '../services/create-refund.service';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class RefundController {
  constructor(
    private readonly createRefundService: CreateRefundService,
  ) { }

  @Post(':id/refunds')
  @Permissions(Permission.ORDER_UPDATE)
  @ApiOperation({
    summary: 'Create a refund',
    description: 'Creates a refund request for an existing payment.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Original payment ID.',
  })
  @ApiResponse({
    status: 201,
    description: 'Refund created successfully.',
    type: RefundResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid refund request or amount.' })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  create(
    @Param('id') id: string,
    @Body() dto: CreateRefundDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createRefundService.execute(id, dto, userId);
  }
}