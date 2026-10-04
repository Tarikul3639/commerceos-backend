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

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateBrandDto } from '@/modules/catalog/brands/dto/requests/create-brand.dto';
import { UpdateBrandDto } from '@/modules/catalog/brands/dto/requests/update-brand.dto';
import { BrandQueryDto } from '@/modules/catalog/brands/dto/requests/brand-query.dto';

// Services
import { CreateBrandService } from '@/modules/catalog/brands/services/create-brand.service';
import { GetBrandsService } from '@/modules/catalog/brands/services/get-brands.service';
import { GetBrandService } from '@/modules/catalog/brands/services/get-brand.service';
import { UpdateBrandService } from '@/modules/catalog/brands/services/update-brand.service';
import { DeleteBrandService } from '@/modules/catalog/brands/services/delete-brand.service';

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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new brand',
  })
  async create(@Body() createBrandDto: CreateBrandDto) {
    return await this.createBrandService.execute(createBrandDto);
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
  ) {
    return await this.updateBrandService.execute(brandId, updateBrandDto);
  }

  /**
   * Delete brand
   *
   * Soft deletes the brand if it has associated products.
   * Otherwise, permanently deletes the brand.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete brand',
  })
  @ApiParam({
    name: 'id',
    description: 'Brand ID',
  })
  async remove(@Param('id') brandId: string): Promise<void> {
    await this.deleteBrandService.execute(brandId);
  }
}
