import { Module } from '@nestjs/common';

import { CategoryController } from './controllers/category.controller';

// Services
import { CreateCategoryService } from './services/create-category.service';
import { GetCategoriesService } from './services/get-categories.service';
import { GetCategoryService } from './services/get-category.service';
import { UpdateCategoryService } from './services/update-category.service';
import { DeleteCategoryService } from './services/delete-category.service';

@Module({
    controllers: [
        CategoryController,
    ],

    providers: [
        CreateCategoryService,
        GetCategoriesService,
        GetCategoryService,
        UpdateCategoryService,
        DeleteCategoryService,
    ],
})
export class CategoryModule { }