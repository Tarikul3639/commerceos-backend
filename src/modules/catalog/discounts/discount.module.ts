import { Module } from '@nestjs/common';

import { DiscountController } from './controllers/discount.controller';

// Services
import { CreateDiscountService } from './services/create-discount.service';
import { GetDiscountsService } from './services/get-discounts.service';
import { GetDiscountService } from './services/get-discount.service';
import { UpdateDiscountService } from './services/update-discount.service';
import { DeleteDiscountService } from './services/delete-discount.service';
import { AssignProductDiscountService } from './services/assign-product-discount.service';
import { RemoveProductDiscountService } from './services/remove-product-discount.service';

@Module({
    controllers: [
        DiscountController,
    ],

    providers: [
        CreateDiscountService,
        GetDiscountsService,
        GetDiscountService,
        UpdateDiscountService,
        DeleteDiscountService,
        AssignProductDiscountService,
        RemoveProductDiscountService,
    ],
})
export class DiscountModule { }