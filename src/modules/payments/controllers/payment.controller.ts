import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentCustomer } from '../../../common/decorators/current-customer.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { CustomerJwtAuthGuard } from '../../../common/guards/customer-jwt-auth.guard.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';
import { CreatePaymentDto } from '../dto/requests/create-payment.dto.js';
import { PaymentQueryDto } from '../dto/requests/payment-query.dto.js';
import { UpdatePaymentStatusDto } from '../dto/requests/update-payment-status.dto.js';
import { PaymentResponseDto } from '../dto/responses/payment-response.dto.js';
import { CreatePaymentService } from '../services/create-payment.service.js';
import { GetPaymentService } from '../services/get-payment.service.js';
import { GetPaymentsService } from '../services/get-payments.service.js';
import { UpdatePaymentStatusService } from '../services/update-payment-status.service.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly getPaymentService: GetPaymentService,
    private readonly getPaymentsService: GetPaymentsService,
    private readonly updatePaymentStatusService: UpdatePaymentStatusService,
  ) {}

  @Post()
  @UseGuards(CustomerJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a payment',
    description:
      'Creates a payment for an order owned by the authenticated customer.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid payment request.' })
  @ApiResponse({
    status: 401,
    description: 'Customer authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Order does not belong to the customer.',
  })
  create(
    @Body() dto: CreatePaymentDto,
    @CurrentCustomer('id') customerId: string,
  ) {
    return this.createPaymentService.execute(dto, customerId);
  }

  @Get()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ORDER_READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payments',
    description: 'Returns a filtered, paginated list of payment transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully.',
    type: PaymentResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  findAll(@Query() query: PaymentQueryDto) {
    return this.getPaymentsService.execute(query);
  }

  @Get(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ORDER_READ)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Returns the details of a specific payment transaction.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Payment ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  findOne(@Param('id') id: string) {
    return this.getPaymentService.execute(id);
  }

  @Patch(':id/status')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.ORDER_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update payment status',
    description:
      'Allows manual cash settlement or marking a pending payment failed/cancelled. Gateway settlement and refund completion require verified provider workflows and are not available here.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Payment ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully.',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or request.',
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.updatePaymentStatusService.execute(id, dto, userId);
  }
}
