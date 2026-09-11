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
} from '@nestjs/common';

import {
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

// DTOs
import { CreateCategoryDto } from '../dto/requests/create-category.dto';
import { UpdateCategoryDto } from '../dto/requests/update-category.dto';
import { CategoryQueryDto } from '../dto/requests/category-query.dto';

// Services
import { CreateCategoryService } from '../services/create-category.service';
import { GetCategoriesService } from '../services/get-categories.service';
import { GetCategoryService } from '../services/get-category.service';
import { UpdateCategoryService } from '../services/update-category.service';
import { DeleteCategoryService } from '../services/delete-category.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(
        private readonly createCategoryService: CreateCategoryService,
        private readonly getCategoriesService: GetCategoriesService,
        private readonly getCategoryService: GetCategoryService,
        private readonly updateCategoryService: UpdateCategoryService,
        private readonly deleteCategoryService: DeleteCategoryService,
    ) {}

    /**
     * Create category
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new category',
    })
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        const category =
            await this.createCategoryService.execute(
                createCategoryDto,
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
    async findAll(
        @Query() query: CategoryQueryDto,
    ) {
        return this.getCategoriesService.execute(query);
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
    async findOne(
        @Param('id') categoryId: string,
    ) {
        const category =
            await this.getCategoryService.execute(
                categoryId,
            );

        return {
            data: category,
        };
    }

    /**
     * Update category
     */
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
    ) {
        const category =
            await this.updateCategoryService.execute(
                categoryId,
                updateCategoryDto,
            );

        return {
            message: 'Category updated successfully',
            data: category,
        };
    }

    /**
     * Delete category
     */
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
    ): Promise<void> {
        await this.deleteCategoryService.execute(
            categoryId,
        );
    }
}