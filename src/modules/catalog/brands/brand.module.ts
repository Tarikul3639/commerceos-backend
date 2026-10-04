import { Module } from '@nestjs/common';

import { BrandController } from '@/modules/catalog/brands/controllers/brand.controller';

// Services
import { CreateBrandService } from '@/modules/catalog/brands/services/create-brand.service';
import { GetBrandsService } from '@/modules/catalog/brands/services/get-brands.service';
import { GetBrandService } from '@/modules/catalog/brands/services/get-brand.service';
import { UpdateBrandService } from '@/modules/catalog/brands/services/update-brand.service';
import { DeleteBrandService } from '@/modules/catalog/brands/services/delete-brand.service';

@Module({
  controllers: [BrandController],

  providers: [
    CreateBrandService,
    GetBrandsService,
    GetBrandService,
    UpdateBrandService,
    DeleteBrandService,
  ],
})
export class BrandModule {}
