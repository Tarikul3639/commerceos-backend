import { Module } from '@nestjs/common';

import { AdminCartController } from './controllers/admin-cart.controller.js';
import { CartController } from './controllers/cart.controller.js';

// Services
import { AddCartItemService } from './services/add-cart-item.service.js';
import { ClearCartService } from './services/clear-cart.service.js';
import { GetAdminCartsService } from './services/get-admin-carts.service.js';
import { GetCartService } from './services/get-cart.service.js';
import { RemoveCartItemService } from './services/remove-cart-item.service.js';
import { UpdateCartItemService } from './services/update-cart-item.service.js';

@Module({
  controllers: [CartController, AdminCartController],

  providers: [
    AddCartItemService,
    GetCartService,
    UpdateCartItemService,
    RemoveCartItemService,
    ClearCartService,
    GetAdminCartsService,
  ],

  exports: [
    AddCartItemService,
    GetCartService,
    UpdateCartItemService,
    RemoveCartItemService,
    ClearCartService,
    GetAdminCartsService,
  ],
})
export class CartModule {}
