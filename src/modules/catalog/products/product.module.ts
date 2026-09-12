import { Module } from '@nestjs/common';

import { ProductController } from './controllers/product.controller';
import { ProductImageController } from './controllers/product-image.controller';
import { ProductVariantController } from './controllers/product-variant.controller';

// Product Services
import { CreateProductService } from './services/create-product.service';
import { GetProductsService } from './services/get-products.service';
import { GetProductService } from './services/get-product.service';
import { UpdateProductService } from './services/update-product.service';
import { DeleteProductService } from './services/delete-product.service';

// Product Image Services
import { AddProductImageService } from './services/add-product-image.service';
import { UpdateProductImageService } from './services/update-product-image.service';
import { DeleteProductImageService } from './services/delete-product-image.service';

// Product Variant Services
import { CreateProductVariantService } from './services/create-product-variant.service';
import { UpdateProductVariantService } from './services/update-product-variant.service';
import { DeleteProductVariantService } from './services/delete-product-variant.service';

@Module({
    controllers: [
        ProductController,
        ProductImageController,
        ProductVariantController,
    ],

    providers: [
        // Product
        CreateProductService,
        GetProductsService,
        GetProductService,
        UpdateProductService,
        DeleteProductService,

        // Product Images
        AddProductImageService,
        UpdateProductImageService,
        DeleteProductImageService,

        // Product Variants
        CreateProductVariantService,
        UpdateProductVariantService,
        DeleteProductVariantService,
    ],
})
export class ProductModule {}