import { Module } from '@nestjs/common';

// Controllers
import { OrderController } from './controllers/order.controller.js';
import { OrderReturnController } from './controllers/order-return.controller.js';

// Services
import { CancelOrderService } from './services/cancel-order.service.js';
import { CreateOrderReturnService } from './services/create-order-return.service.js';
import { CreateOrderService } from './services/create-order.service.js';
import { DecideOrderReturnService } from './services/decide-order-return.service.js';
import { GetOrderReturnService } from './services/get-order-return.service.js';
import { GetOrderReturnsService } from './services/get-order-returns.service.js';
import { GetOrderService } from './services/get-order.service.js';
import { GetOrdersService } from './services/get-orders.service.js';
import { UpdateOrderStatusService } from './services/update-order-status.service.js';

@Module({
  controllers: [OrderController, OrderReturnController],

  providers: [
    // Order Services
    CreateOrderService,
    GetOrderService,
    GetOrdersService,
    UpdateOrderStatusService,
    CancelOrderService,

    // Order Return Services
    CreateOrderReturnService,
    GetOrderReturnService,
    GetOrderReturnsService,
    DecideOrderReturnService,
  ],

  exports: [CreateOrderService, GetOrderService, GetOrdersService],
})
export class OrderModule {}
