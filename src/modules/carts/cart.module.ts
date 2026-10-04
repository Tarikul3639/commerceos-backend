import { Module } from '@nestjs/common';

import { CartController } from '@/modules/carts/controllers/cart.controller';

// Services
import { AddCartItemService } from '@/modules/carts/services/add-cart-item.service';
import { ClearCartService } from '@/modules/carts/services/clear-cart.service';
import { GetCartService } from '@/modules/carts/services/get-cart.service';
import { RemoveCartItemService } from '@/modules/carts/services/remove-cart-item.service';
import { UpdateCartItemService } from '@/modules/carts/services/update-cart-item.service';

@Module({
  controllers: [CartController],

  providers: [
    AddCartItemService,
    GetCartService,
    UpdateCartItemService,
    RemoveCartItemService,
    ClearCartService,
  ],

  exports: [
    AddCartItemService,
    GetCartService,
    UpdateCartItemService,
    RemoveCartItemService,
    ClearCartService,
  ],
})
export class CartModule {}
