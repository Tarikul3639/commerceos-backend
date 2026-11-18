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
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateOrderDto } from '../dto/requests/create-order.dto';
import { OrderQueryDto } from '../dto/requests/order-query.dto';
import { CancelOrderDto } from '../dto/requests/cancel-order.dto';
import { UpdateOrderStatusDto } from '../dto/requests/update-order-status.dto';

import { CreateOrderService } from '../services/create-order.service';
import { GetOrderService } from '../services/get-order.service';
import { GetOrdersService } from '../services/get-orders.service';
import { CancelOrderService } from '../services/cancel-order.service';
import { UpdateOrderStatusService } from '../services/update-order-status.service';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderService: CreateOrderService,
    private readonly getOrderService: GetOrderService,
    private readonly getOrdersService: GetOrdersService,
    private readonly cancelOrderService: CancelOrderService,
    private readonly updateOrderStatusService: UpdateOrderStatusService,
  ) {}

  @Post()
  @Permissions(Permission.ORDER_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
  })
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.createOrderService.execute(createOrderDto, req.user.id);
  }

  @Get()
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({
    summary: 'Get all orders',
  })
  async findAll(@Query() query: OrderQueryDto) {
    return this.getOrdersService.execute(query);
  }

  @Get(':id')
  @Permissions(Permission.ORDER_READ)
  @ApiOperation({
    summary: 'Get order by ID',
  })
  @ApiParam({
    name: 'id',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  async findOne(@Param('id') orderId: string) {
    return this.getOrderService.execute(orderId);
  }

  @Patch(':id/status')
  @Permissions(Permission.ORDER_UPDATE)
  @ApiOperation({
    summary: 'Update order status',
  })
  @ApiParam({
    name: 'id',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusService.execute(orderId, updateOrderStatusDto);
  }

  @Patch(':id/cancel')
  @Permissions(Permission.ORDER_UPDATE)
  @ApiOperation({
    summary: 'Cancel an order',
  })
  @ApiParam({
    name: 'id',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  async cancel(
    @Param('id') orderId: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ) {
    return this.cancelOrderService.execute(orderId, cancelOrderDto);
  }
}
