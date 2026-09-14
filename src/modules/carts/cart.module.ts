import { Module } from '@nestjs/common';

import { CartController } from './controllers/cart.controller';

// Services
import { AddCartItemService } from './services/add-cart-item.service';
import { ClearCartService } from './services/clear-cart.service';
import { GetCartService } from './services/get-cart.service';
import { RemoveCartItemService } from './services/remove-cart-item.service';
import { UpdateCartItemService } from './services/update-cart-item.service';

@Module({
    controllers: [
        CartController,
    ],

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