import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../../infrastructure/storage/cloudinary/cloudinary.module.js';

import { CategoryController } from './controllers/category.controller.js';

// Services
import { CreateCategoryService } from './services/create-category.service.js';
import { GetCategoriesService } from './services/get-categories.service.js';
import { GetCategoryService } from './services/get-category.service.js';
import { UpdateCategoryService } from './services/update-category.service.js';
import { DeleteCategoryService } from './services/delete-category.service.js';
import { GetNavigationCategoriesService } from './services/get-navigation-categories.service.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [CategoryController],

  providers: [
    CreateCategoryService,
    GetCategoriesService,
    GetCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
    GetNavigationCategoriesService,
  ],
})
export class CategoryModule {}
