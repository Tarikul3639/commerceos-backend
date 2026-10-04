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
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateOrderDto } from '@/modules/orders/dto/requests/create-order.dto';
import { OrderQueryDto } from '@/modules/orders/dto/requests/order-query.dto';
import { CancelOrderDto } from '@/modules/orders/dto/requests/cancel-order.dto';
import { UpdateOrderStatusDto } from '@/modules/orders/dto/requests/update-order-status.dto';

import { CreateOrderService } from '@/modules/orders/services/create-order.service';
import { GetOrderService } from '@/modules/orders/services/get-order.service';
import { GetOrdersService } from '@/modules/orders/services/get-orders.service';
import { CancelOrderService } from '@/modules/orders/services/cancel-order.service';
import { UpdateOrderStatusService } from '@/modules/orders/services/update-order-status.service';

// import { CurrentUser } from '@/common/decorators/current-user.decorator';
// import type { CurrentUserPayload } from '@/common/interfaces/current-user.interface';

@ApiTags('Orders')
@ApiBearerAuth()
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new order',
  })
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.createOrderService.execute(createOrderDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orders',
  })
  async findAll(@Query() query: OrderQueryDto) {
    return this.getOrdersService.execute(query);
  }

  @Get(':id')
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
  @ApiOperation({
    summary: 'Update order status',
  })
  @ApiParam({
    name: 'id',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  async updateStatus(
    @Param('id') orderId: string,

    @Body()
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.updateOrderStatusService.execute(orderId, updateOrderStatusDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel an order',
  })
  @ApiParam({
    name: 'id',
    example: 'clxxxxxxxxxxxxxxxx',
  })
  async cancel(
    @Param('id') orderId: string,

    @Body()
    cancelOrderDto: CancelOrderDto,
  ) {
    return this.cancelOrderService.execute(orderId, cancelOrderDto);
  }
}
