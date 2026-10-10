
import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';

import { ProductOptionsController } from './controllers/product-options.controller';

import { CreateProductOptionService } from './services/create-product-option.service';
import { DeleteProductOptionService } from './services/delete-product-option.service';
import { GenerateProductVariantsService } from './services/generate-product-variants.service';
import { GetProductOptionsService } from './services/get-product-options.service';
import { UpdateProductOptionService } from './services/update-product-option.service';

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
