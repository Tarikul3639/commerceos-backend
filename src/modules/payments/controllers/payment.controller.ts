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
import { CurrentCustomer } from '@/common/decorators/current-customer.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { CustomerJwtAuthGuard } from '@/common/guards/customer-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission, PaymentStatus } from '@/lib/prisma/enums';
import { CreatePaymentDto } from '../dto/requests/create-payment.dto';
import { PaymentQueryDto } from '../dto/requests/payment-query.dto';
import { UpdatePaymentStatusDto } from '../dto/requests/update-payment-status.dto';
import { PaymentResponseDto } from '../dto/responses/payment-response.dto';
import { CreatePaymentService } from '../services/create-payment.service';
import { GetPaymentService } from '../services/get-payment.service';
import { GetPaymentsService } from '../services/get-payments.service';
import { UpdatePaymentStatusService } from '../services/update-payment-status.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly getPaymentService: GetPaymentService,
    private readonly getPaymentsService: GetPaymentsService,
    private readonly updatePaymentStatusService: UpdatePaymentStatusService,
  ) { }

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
      'Updates payment status according to the backend payment workflow.',
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
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    if (dto.status === PaymentStatus.PAID && !dto.transactionId) {
      // The service permits CASH payments without a gateway transaction.
    }

    return this.updatePaymentStatusService.execute(id, dto);
  }
}
