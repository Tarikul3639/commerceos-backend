import { Module } from '@nestjs/common';

import { BrandController } from './controllers/brand.controller';

// Services
import { CreateBrandService } from './services/create-brand.service';
import { GetBrandsService } from './services/get-brands.service';
import { GetBrandService } from './services/get-brand.service';
import { UpdateBrandService } from './services/update-brand.service';
import { DeleteBrandService } from './services/delete-brand.service';

@Module({
    controllers: [
        BrandController,
    ],

    providers: [
        CreateBrandService,
        GetBrandsService,
        GetBrandService,
        UpdateBrandService,
        DeleteBrandService,
    ],
})
export class BrandModule { }