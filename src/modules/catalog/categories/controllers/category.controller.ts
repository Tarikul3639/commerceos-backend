import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../../infrastructure/database/generated/prisma/enums.js';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateCategoryDto } from '../dto/requests/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/requests/update-category.dto.js';
import { CategoryQueryDto } from '../dto/requests/category-query.dto.js';

// Services
import { CreateCategoryService } from '../services/create-category.service.js';
import { GetCategoriesService } from '../services/get-categories.service.js';
import { GetCategoryService } from '../services/get-category.service.js';
import { UpdateCategoryService } from '../services/update-category.service.js';
import { DeleteCategoryService } from '../services/delete-category.service.js';
import { GetNavigationCategoriesService } from '../services/get-navigation-categories.service.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryService: CreateCategoryService,
    private readonly getCategoriesService: GetCategoriesService,
    private readonly getCategoryService: GetCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly deleteCategoryService: DeleteCategoryService,
    private readonly getNavigationCategoriesService: GetNavigationCategoriesService,
  ) {}

  /**
   * Create category
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.CATEGORY_CREATE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    const category = await this.createCategoryService.execute(
      createCategoryDto,
      userId,
    );

    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  /**
   * Get all categories
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all categories',
  })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.getCategoriesService.execute(query);
  }

  /**
   * Get a small list of active categories for storefront navigation
   */
  @Get('navigation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get storefront navigation categories',
  })
  async getNavigationCategories() {
    return this.getNavigationCategoriesService.execute();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get category by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  async findOne(@Param('id') categoryId: string) {
    const category = await this.getCategoryService.execute(categoryId);

    return {
      data: category,
    };
  }

  /**
   * Update category
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.CATEGORY_UPDATE)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  async update(
    @Param('id') categoryId: string,

    @Body()
    updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    const category = await this.updateCategoryService.execute(
      categoryId,
      updateCategoryDto,
      userId,
    );

    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  /**
   * Delete category
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.CATEGORY_DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete category',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
  })
  async remove(
    @Param('id') categoryId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.deleteCategoryService.execute(categoryId, userId);
  }
}
