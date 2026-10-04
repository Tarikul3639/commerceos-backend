import { Module } from '@nestjs/common';

// Controllers
import { OrderController } from '@/modules/orders/controllers/order.controller';
import { OrderReturnController } from '@/modules/orders/controllers/order-return.controller';

// Services
import { CancelOrderService } from '@/modules/orders/services/cancel-order.service';
import { CreateOrderReturnService } from '@/modules/orders/services/create-order-return.service';
import { CreateOrderService } from '@/modules/orders/services/create-order.service';
import { GetOrderReturnService } from '@/modules/orders/services/get-order-return.service';
import { GetOrderReturnsService } from '@/modules/orders/services/get-order-returns.service';
import { GetOrderService } from '@/modules/orders/services/get-order.service';
import { GetOrdersService } from '@/modules/orders/services/get-orders.service';
import { UpdateOrderStatusService } from '@/modules/orders/services/update-order-status.service';

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
  ],

  exports: [CreateOrderService, GetOrderService, GetOrdersService],
})
export class OrderModule {}
