
import { Module } from '@nestjs/common';

import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { PrismaModule } from '@/common/prisma/prisma.module';

import { ProductImagesController } from './controllers/product-images.controller';

import { AddProductImageService } from './services/add-product-image.service';
import { DeleteProductImageService } from './services/delete-product-image.service';
import { GetProductImagesService } from './services/get-product-images.service';
import { UpdateProductImageService } from './services/update-product-image.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProductImagesController],
  providers: [
    AddProductImageService,
    GetProductImagesService,
    UpdateProductImageService,
    DeleteProductImageService,
  ],
})
export class ProductImageModule {}
