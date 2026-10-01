import { Module } from '@nestjs/common';

import { ProductController } from './controllers/product.controller';
// Product Services
import { CreateProductService } from './services/create-product.service';
import { GetProductsService } from './services/get-products.service';
import { GetProductService } from './services/get-product.service';
import { UpdateProductService } from './services/update-product.service';
import { DeleteProductService } from './services/delete-product.service';


@Module({
    controllers: [
        ProductController,
    ],

    providers: [
        // Product
        CreateProductService,
        GetProductsService,
        GetProductService,
        UpdateProductService,
        DeleteProductService,
    ],
})
export class ProductModule { }
