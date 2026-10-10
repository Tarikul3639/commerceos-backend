import { Module } from '@nestjs/common';

import { BrandModule } from './brands/brand.module';
import { CategoryModule } from './categories/category.module';
import { ProductModule } from './products/product.module';
import { ProductImageModule } from './product-images/product-image.module';
import { ProductVariantModule } from './product-variants/product-variant.module';
import { ProductOptionModule } from './product-options/product-option.module';

@Module({
  imports: [
    BrandModule,
    CategoryModule,
    ProductModule,
    ProductImageModule,
    ProductVariantModule,
    ProductOptionModule,
  ],
})
export class CatalogModule { }
