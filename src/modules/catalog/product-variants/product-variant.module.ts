import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../common/prisma/prisma.module.js';

import { ProductVariantsController } from './controllers/product-variants.controller.js';

import { CreateProductVariantService } from './services/create-product-variant.service.js';
import { DeleteProductVariantService } from './services/delete-product-variant.service.js';
import { GetProductVariantsService } from './services/get-product-variants.service.js';
import { UpdateProductVariantService } from './services/update-product-variant.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductVariantsController],
  providers: [
    CreateProductVariantService,
    GetProductVariantsService,
    UpdateProductVariantService,
    DeleteProductVariantService,
  ],
})
export class ProductVariantModule {}
