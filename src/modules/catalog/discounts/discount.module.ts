import { Module } from '@nestjs/common';

import { DiscountController } from './controllers/discount.controller';

// Services
import { GetDiscountsService } from './services/get-discounts.service';
import { GetDiscountService } from './services/get-discount.service';
import { DeleteDiscountService } from './services/delete-discount.service';
import { CreateDiscountService } from './services/create-discount.service';
import { UpdateDiscountService } from './services/update-discount.service';

@Module({
  controllers: [DiscountController],

  providers: [
    CreateDiscountService,
    GetDiscountsService,
    GetDiscountService,
    UpdateDiscountService,
    DeleteDiscountService,
  ],
})
export class DiscountModule {}
