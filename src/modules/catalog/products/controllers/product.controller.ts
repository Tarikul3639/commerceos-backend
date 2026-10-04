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

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateProductDto } from '../dto/requests/create-product.dto';
import { UpdateProductDto } from '../dto/requests/update-product.dto';
import { ProductQueryDto } from '../dto/requests/product-query.dto';

// Response DTOs
import { ProductResponseDto } from '../dto/responses/product-response.dto';
import { ProductListResponseDto } from '../dto/responses/product-list-response.dto';

// Services
import { CreateProductService } from '../services/create-product.service';
import { GetProductsService } from '../services/get-products.service';
import { GetProductService } from '../services/get-product.service';
import { UpdateProductService } from '../services/update-product.service';
import { DeleteProductService } from '../services/delete-product.service';
import { RestoreProductService } from '../services/restore-product.service';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { UserJwtAuthGuard } from '../../../../common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Permission } from '../../../../lib/prisma/enums';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductService: CreateProductService,
    private readonly getProductsService: GetProductsService,
    private readonly getProductService: GetProductService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
    private readonly restoreProductService: RestoreProductService,
  ) {}

  /**
   * Create product
   */
  @Post()
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.createProductService.execute(userId, dto);
  }

  /**
   * Get all products
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all products',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Products retrieved successfully',
    type: ProductListResponseDto,
  })
  async findAll(@Query() query: ProductQueryDto) {
    return await this.getProductsService.execute(query);
  }

  /**
   * Get product by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get product by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  async findOne(@Param('id') productId: string) {
    return await this.getProductService.execute(productId);
  }

  /**
   * Update product
   */
  @Patch(':id')
  @UseGuards(UserJwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.PRODUCT_UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update product',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  async update(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ) {
    return await this.updateProductService.execute(productId, userId, dto);
  }

  /**
   * Delete product
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Product deleted successfully',
  })
  async remove(@Param('id') productId: string): Promise<void> {
    await this.deleteProductService.execute(productId);
  }

  /**
   * Restore product
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore product',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product restored successfully',
  })
  async restore(@Param('id') id: string): Promise<void> {
    return this.restoreProductService.execute(id);
  }
}
