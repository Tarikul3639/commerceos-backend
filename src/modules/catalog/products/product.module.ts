import { Module } from '@nestjs/common';

import { AdminProductsController } from './controllers/admin/admin-products.controller';
import { AdminProductDetailsController } from './controllers/admin/admin-product-details.controller';
import { AdminProductImagesController } from './controllers/admin/admin-product-images.controller';
import { AdminProductVariantsController } from './controllers/admin/admin-product-variants.controller';
import { AdminProductDiscountsController } from './controllers/admin/admin-product-discounts.controller';
import { StoreProductsController } from './controllers/store/store-products.controller';
import { StoreProductDetailsController } from './controllers/store/store-product-details.controller';

import { CreateProductService as AdminCreateProductService } from './services/admin/create-product.service';
import { GetAdminProductsService } from './services/admin/get-admin-products.service';
import { GetAdminProductDetailsService } from './services/admin/get-admin-product-details.service';
import { UpdateProductService as AdminUpdateProductService } from './services/admin/update-product.service';
import { DeleteProductService as AdminDeleteProductService } from './services/admin/delete-product.service';
import { GetStoreProductsService } from './services/store/get-store-products.service';
import { GetStoreProductDetailsService } from './services/store/get-store-product-details.service';

import { AddProductImageService } from './services/images/add-product-image.service';
import { UpdateProductImageService } from './services/images/update-product-image.service';
import { DeleteProductImageService } from './services/images/delete-product-image.service';

import { CreateProductVariantService } from './services/variants/create-product-variant.service';
import { UpdateProductVariantService } from './services/variants/update-product-variant.service';
import { DeleteProductVariantService } from './services/variants/delete-product-variant.service';

import { CreateProductOptionService } from './services/options/create-product-option.service';
import { UpdateProductOptionService } from './services/options/update-product-option.service';
import { DeleteProductOptionService } from './services/options/delete-product-option.service';
import { GenerateProductVariantsService } from './services/options/generate-product-variants.service';

import { SetProductDiscountService } from './services/discounts/set-product-discount.service';
import { GetProductDiscountService } from './services/discounts/get-product-discount.service';
import { RemoveProductDiscountService } from './services/discounts/remove-product-discount.service';

@Module({
  controllers: [
    AdminProductsController,
    AdminProductDetailsController,
    AdminProductImagesController,
    AdminProductVariantsController,
    AdminProductDiscountsController,
    StoreProductsController,
    StoreProductDetailsController,
  ],
  providers: [
    AdminCreateProductService,
    GetAdminProductsService,
    GetAdminProductDetailsService,
    AdminUpdateProductService,
    AdminDeleteProductService,
    GetStoreProductsService,
    GetStoreProductDetailsService,
    AddProductImageService,
    UpdateProductImageService,
    DeleteProductImageService,
    CreateProductVariantService,
    UpdateProductVariantService,
    DeleteProductVariantService,
    CreateProductOptionService,
    UpdateProductOptionService,
    DeleteProductOptionService,
    GenerateProductVariantsService,
    SetProductDiscountService,
    GetProductDiscountService,
    RemoveProductDiscountService,
  ],
})
export class ProductModule {}
