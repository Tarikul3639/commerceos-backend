import { Module } from '@nestjs/common';

import { BrandModule } from './brands/brand.module.js';
import { CategoryModule } from './categories/category.module.js';
import { ProductModule } from './products/product.module.js';
import { ProductImageModule } from './product-images/product-image.module.js';
import { ProductVariantModule } from './product-variants/product-variant.module.js';
import { ProductOptionModule } from './product-options/product-option.module.js';

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
export class CatalogModule {}
