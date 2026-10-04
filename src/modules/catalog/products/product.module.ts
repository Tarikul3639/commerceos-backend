import { Module } from '@nestjs/common';

import { ProductController } from '@/modules/catalog/products/controllers/product.controller';
// Product Services
import { CreateProductService } from '@/modules/catalog/products/services/create-product.service';
import { GetProductsService } from '@/modules/catalog/products/services/get-products.service';
import { GetProductService } from '@/modules/catalog/products/services/get-product.service';
import { UpdateProductService } from '@/modules/catalog/products/services/update-product.service';
import { DeleteProductService } from '@/modules/catalog/products/services/delete-product.service';
import { RestoreProductService } from '@/modules/catalog/products/services/restore-product.service';

@Module({
  controllers: [ProductController],

  providers: [
    // Product
    CreateProductService,
    GetProductsService,
    GetProductService,
    UpdateProductService,
    DeleteProductService,
    RestoreProductService,
  ],
})
export class ProductModule {}
