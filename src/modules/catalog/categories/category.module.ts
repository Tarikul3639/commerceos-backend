import { Module } from '@nestjs/common';

import { CategoryController } from '@/modules/catalog/categories/controllers/category.controller';

// Services
import { CreateCategoryService } from '@/modules/catalog/categories/services/create-category.service';
import { GetCategoriesService } from '@/modules/catalog/categories/services/get-categories.service';
import { GetCategoryService } from '@/modules/catalog/categories/services/get-category.service';
import { UpdateCategoryService } from '@/modules/catalog/categories/services/update-category.service';
import { DeleteCategoryService } from '@/modules/catalog/categories/services/delete-category.service';

@Module({
  controllers: [CategoryController],

  providers: [
    CreateCategoryService,
    GetCategoriesService,
    GetCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
  ],
})
export class CategoryModule {}
