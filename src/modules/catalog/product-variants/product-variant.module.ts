import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';

import { ProductVariantsController } from './controllers/product-variants.controller';

import { CreateProductVariantService } from './services/create-product-variant.service';
import { DeleteProductVariantService } from './services/delete-product-variant.service';
import { GetProductVariantsService } from './services/get-product-variants.service';
import { UpdateProductVariantService } from './services/update-product-variant.service';

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
export class ProductVariantModule { }