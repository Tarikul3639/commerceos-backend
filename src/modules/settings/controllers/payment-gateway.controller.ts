import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/lib/prisma/enums';

import { CreatePaymentGatewayDto } from '../dto/requests/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../dto/requests/update-payment-gateway.dto';
import { PaymentGatewayResponseDto } from '../dto/responses/payment-gateway-response.dto';

import { PaymentGatewayService } from '../services/payment-gateway.service';

@ApiTags('Payment Gateway')
@ApiBearerAuth()
@Controller('settings/payment-gateway')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  /** Creates a new payment gateway configuration. */
  @Post()
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOperation({ summary: 'Create payment gateway configuration' })
  @ApiCreatedResponse({
    description: 'Payment gateway configuration created successfully',
    type: PaymentGatewayResponseDto,
  })
  create(
    @Body() createPaymentGatewayDto: CreatePaymentGatewayDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentGatewayService.create(createPaymentGatewayDto, userId);
  }

  /** Returns all configured payment gateways. */
  @Get()
  @Permissions(Permission.SETTING_READ)
  @ApiOperation({ summary: 'Get all payment gateway configurations' })
  @ApiOkResponse({
    description: 'Payment gateway configurations retrieved successfully',
    type: PaymentGatewayResponseDto,
    isArray: true,
  })
  findAll() {
    return this.paymentGatewayService.findAll();
  }

  /** Returns one payment gateway configuration by its ID. */
  @Get(':id')
  @Permissions(Permission.SETTING_READ)
  @ApiOperation({ summary: 'Get payment gateway configuration by ID' })
  @ApiOkResponse({
    description: 'Payment gateway configuration retrieved successfully',
    type: PaymentGatewayResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment gateway configuration not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentGatewayService.findOne(id);
  }

  /** Updates an existing payment gateway configuration. */
  @Patch(':id')
  @Permissions(Permission.SETTING_UPDATE)
  @ApiOperation({ summary: 'Update payment gateway configuration' })
  @ApiOkResponse({
    description: 'Payment gateway configuration updated successfully',
    type: PaymentGatewayResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment gateway configuration not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePaymentGatewayDto: UpdatePaymentGatewayDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentGatewayService.update(
      id,
      updatePaymentGatewayDto,
      userId,
    );
  }
}
