import { Module } from '@nestjs/common';

import { PrismaModule } from '../../../common/prisma/prisma.module.js';

import { ProductOptionsController } from './controllers/product-options.controller.js';

import { CreateProductOptionService } from './services/create-product-option.service.js';
import { DeleteProductOptionService } from './services/delete-product-option.service.js';
import { GenerateProductVariantsService } from './services/generate-product-variants.service.js';
import { GetProductOptionsService } from './services/get-product-options.service.js';
import { UpdateProductOptionService } from './services/update-product-option.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductOptionsController],
  providers: [
    CreateProductOptionService,
    GetProductOptionsService,
    UpdateProductOptionService,
    DeleteProductOptionService,
    GenerateProductVariantsService,
  ],
  exports: [
    CreateProductOptionService,
    GetProductOptionsService,
    UpdateProductOptionService,
    DeleteProductOptionService,
    GenerateProductVariantsService,
  ],
})
export class ProductOptionModule {}
