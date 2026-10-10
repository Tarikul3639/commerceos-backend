import { Module } from '@nestjs/common';

import { BrandModule } from './brands/brand.module';
import { ProductModule } from './products/product.module';

@Module({
  imports: [BrandModule, ProductModule],
})
export class CatalogModule {}