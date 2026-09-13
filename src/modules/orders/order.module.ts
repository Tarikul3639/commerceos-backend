import { Module } from '@nestjs/common';

// Controllers
import { OrderController } from './controllers/order.controller';
import { OrderReturnController } from './controllers/order-return.controller';

// Services
import { CancelOrderService } from './services/cancel-order.service';
import { CreateOrderReturnService } from './services/create-order-return.service';
import { CreateOrderService } from './services/create-order.service';
import { GetOrderReturnService } from './services/get-order-return.service';
import { GetOrderReturnsService } from './services/get-order-returns.service';
import { GetOrderService } from './services/get-order.service';
import { GetOrdersService } from './services/get-orders.service';
import { UpdateOrderStatusService } from './services/update-order-status.service';

@Module({
    controllers: [
        OrderController,
        OrderReturnController,
    ],

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

    exports: [
        CreateOrderService,
        GetOrderService,
        GetOrdersService,
    ],
})
export class OrderModule {}