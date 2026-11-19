import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../infrastructure/database/generated/prisma/enums.js';

import { CreateOrderReturnDto } from '../dto/requests/create-order-return.dto.js';
import { OrderReturnQueryDto } from '../dto/requests/order-return-query.dto.js';
import { RejectOrderReturnDto } from '../dto/requests/reject-order-return.dto.js';
import { CreateOrderReturnService } from '../services/create-order-return.service.js';
import { DecideOrderReturnService } from '../services/decide-order-return.service.js';
import { GetOrderReturnService } from '../services/get-order-return.service.js';
import { GetOrderReturnsService } from '../services/get-order-returns.service.js';

@ApiTags('Order Returns')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Controller('order-returns')
export class OrderReturnController {
  constructor(
    private readonly createOrderReturnService: CreateOrderReturnService,
    private readonly getOrderReturnService: GetOrderReturnService,
    private readonly getOrderReturnsService: GetOrderReturnsService,
    private readonly decideOrderReturnService: DecideOrderReturnService,
  ) {}

  @Post('order/:orderId')
  @Permissions(Permission.ORDER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an order return' })
  @ApiParam({ name: 'orderId', example: 'clxxxxxxxxxxxxxxxx' })
  async create(
    @Param('orderId') orderId: string,
    @Body() createOrderReturnDto: CreateOrderReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createOrderReturnService.execute(
      orderId,
      createOrderReturnDto,
      userId,
    );
  }

  @Get()
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get all order returns' })
  async findAll(@Query() query: OrderReturnQueryDto) {
    return this.getOrderReturnsService.execute(query);
  }

  @Get(':id')
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({ summary: 'Get order return by ID' })
  @ApiParam({ name: 'id', example: 'clxxxxxxxxxxxxxxxx' })
  async findOne(@Param('id') orderReturnId: string) {
    return this.getOrderReturnService.execute(orderReturnId);
  }

  @Patch(':id/approve')
  @Permissions(Permission.ORDER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending order return' })
  async approve(
    @Param('id') orderReturnId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.decideOrderReturnService.approve(orderReturnId, userId);
    return this.getOrderReturnService.execute(orderReturnId);
  }

  @Patch(':id/reject')
  @Permissions(Permission.ORDER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a pending order return' })
  async reject(
    @Param('id') orderReturnId: string,
    @Body() dto: RejectOrderReturnDto,
    @CurrentUser('id') userId: string,
  ) {
    await this.decideOrderReturnService.reject(
      orderReturnId,
      userId,
      dto.reason,
    );
    return this.getOrderReturnService.execute(orderReturnId);
  }

  @Patch(':id/complete')
  @Permissions(Permission.ORDER_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete an approved return and restore returned variant stock',
  })
  async complete(
    @Param('id') orderReturnId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.decideOrderReturnService.complete(orderReturnId, userId);
    return this.getOrderReturnService.execute(orderReturnId);
  }
}
