import { Module } from '@nestjs/common';

import { DiscountController } from '@/modules/catalog/discounts/controllers/discount.controller';

// Services
import { GetDiscountsService } from '@/modules/catalog/discounts/services/get-discounts.service';
import { GetDiscountService } from '@/modules/catalog/discounts/services/get-discount.service';
import { DeleteDiscountService } from '@/modules/catalog/discounts/services/delete-discount.service';
import { CreateDiscountService } from '@/modules/catalog/discounts/services/create-discount.service';
import { UpdateDiscountService } from '@/modules/catalog/discounts/services/update-discount.service';

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
