import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../../../infrastructure/storage/cloudinary/cloudinary.module.js';
import { DatabaseModule } from '../../../infrastructure/database/database.module.js';

import { ProductImagesController } from './controllers/product-images.controller.js';

import { AddProductImageService } from './services/add-product-image.service.js';
import { DeleteProductImageService } from './services/delete-product-image.service.js';
import { GetProductImagesService } from './services/get-product-images.service.js';
import { UpdateProductImageService } from './services/update-product-image.service.js';

@Module({
  imports: [DatabaseModule, CloudinaryModule],
  controllers: [ProductImagesController],
  providers: [
    AddProductImageService,
    GetProductImagesService,
    UpdateProductImageService,
    DeleteProductImageService,
  ],
})
export class ProductImageModule {}
