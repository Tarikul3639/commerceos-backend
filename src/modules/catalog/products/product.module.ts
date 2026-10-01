import { Module } from '@nestjs/common';

import { ProductController } from './controllers/product.controller';
import { ProductImageController } from './controllers/product-image.controller';

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


@Module({
    controllers: [
        ProductController,
        ProductImageController,
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

    ],
})
export class ProductModule {}
