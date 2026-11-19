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
import { Permission } from '../../../../lib/prisma/enums.js';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateBrandDto } from '../dto/requests/create-brand.dto.js';
import { UpdateBrandDto } from '../dto/requests/update-brand.dto.js';
import { BrandQueryDto } from '../dto/requests/brand-query.dto.js';

// Services
import { CreateBrandService } from '../services/create-brand.service.js';
import { GetBrandsService } from '../services/get-brands.service.js';
import { GetBrandService } from '../services/get-brand.service.js';
import { UpdateBrandService } from '../services/update-brand.service.js';
import { DeleteBrandService } from '../services/delete-brand.service.js';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(
    private readonly createBrandService: CreateBrandService,
    private readonly getBrandsService: GetBrandsService,
    private readonly getBrandService: GetBrandService,
    private readonly updateBrandService: UpdateBrandService,
    private readonly deleteBrandService: DeleteBrandService,
  ) {}

  /**
   * Create a new brand
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BRAND_CREATE)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new brand',
  })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.createBrandService.execute(createBrandDto, userId);
  }

  /**
   * Get all brands
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all brands',
  })
  async findAll(@Query() query: BrandQueryDto) {
    return this.getBrandsService.execute(query);
  }

  /**
   * Get brand by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get brand by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand ID',
  })
  async findOne(@Param('id') brandId: string) {
    return await this.getBrandService.execute(brandId);
  }

  /**
   * Update brand
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BRAND_UPDATE)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update brand',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand ID',
  })
  async update(
    @Param('id') brandId: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.updateBrandService.execute(brandId, updateBrandDto, userId);
  }

  /**
   * Delete brand
   *
   * Soft deletes the brand if it has associated products.
   * Otherwise, permanently deletes the brand.
   */
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.BRAND_DELETE)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete brand',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand ID',
  })
  async remove(
    @Param('id') brandId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.deleteBrandService.execute(brandId, userId);
  }
}
