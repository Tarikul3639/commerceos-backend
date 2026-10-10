import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';

import { AdminProductsController } from './controllers/admin-products.controller';
import { StoreProductsController } from './controllers/store-products.controller';

import { CreateProductService } from './services/admin/create-product.service';
import { DeleteProductService } from './services/admin/delete-product.service';
import { GetAdminProductDetailsService } from './services/admin/get-admin-product-details.service';
import { GetAdminProductsService } from './services/admin/get-admin-products.service';
import { UpdateProductService } from './services/admin/update-product.service';

import { GetStoreProductDetailsService } from './services/store/get-store-product-details.service';
import { GetStoreProductsService } from './services/store/get-store-products.service';

@Module({
    imports: [PrismaModule],
    controllers: [
        AdminProductsController,
        StoreProductsController,
    ],
    providers: [
        CreateProductService,
        UpdateProductService,
        DeleteProductService,
        GetAdminProductsService,
        GetAdminProductDetailsService,
        GetStoreProductsService,
        GetStoreProductDetailsService,
    ],
    exports: [
        CreateProductService,
        UpdateProductService,
        DeleteProductService,
        GetAdminProductsService,
        GetAdminProductDetailsService,
        GetStoreProductsService,
        GetStoreProductDetailsService,
    ],
})
export class ProductModule {}