import { Module } from '@nestjs/common';

import { BrandController } from './controllers/brand.controller.js';

// Services
import { CreateBrandService } from './services/create-brand.service.js';
import { GetBrandsService } from './services/get-brands.service.js';
import { GetBrandService } from './services/get-brand.service.js';
import { UpdateBrandService } from './services/update-brand.service.js';
import { DeleteBrandService } from './services/delete-brand.service.js';

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
