import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../infrastructure/database/database.module.js';

import { AdminProductsController } from './controllers/admin-products.controller.js';
import { StoreProductsController } from './controllers/store-products.controller.js';

import { CreateProductService } from './services/admin/create-product.service.js';
import { DeleteProductService } from './services/admin/delete-product.service.js';
import { RestoreProductService } from './services/admin/restore-product.service.js';
import { GetAdminProductDetailsService } from './services/admin/get-admin-product-details.service.js';
import { GetAdminProductsService } from './services/admin/get-admin-products.service.js';
import { UpdateProductService } from './services/admin/update-product.service.js';

import { GetStoreProductDetailsService } from './services/store/get-store-product-details.service.js';
import { GetStoreProductsService } from './services/store/get-store-products.service.js';
import { GetStoreNewArrivalsService } from './services/store/get-store-new-arrivals.service.js';
import { GetStoreBestSellersService } from './services/store/get-store-best-sellers.service.js';
import { GetRecentlyViewedProductsService } from './services/store/get-recently-viewed-products.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminProductsController, StoreProductsController],
  providers: [
    CreateProductService,
    UpdateProductService,
    DeleteProductService,
    RestoreProductService,
    GetAdminProductsService,
    GetAdminProductDetailsService,
    GetStoreProductsService,
    GetStoreProductDetailsService,
    GetStoreNewArrivalsService,
    GetStoreBestSellersService,
    GetRecentlyViewedProductsService,
  ],
  exports: [
    CreateProductService,
    UpdateProductService,
    DeleteProductService,
    RestoreProductService,
    GetAdminProductsService,
    GetAdminProductDetailsService,
    GetStoreProductsService,
    GetStoreProductDetailsService,
    GetStoreNewArrivalsService,
    GetStoreBestSellersService,
    GetRecentlyViewedProductsService,
  ],
})
export class ProductModule {}
