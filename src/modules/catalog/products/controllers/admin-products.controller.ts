import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { CreateProductDto } from '../dto/requests/create-product.dto';
import { ProductQueryDto } from '../dto/requests/product-query.dto';
import { UpdateProductDto } from '../dto/requests/update-product.dto';

import { AdminProductDetailResponseDto } from '../dto/responses/admin-product-detail-response.dto';
import { AdminProductListResponseDto } from '../dto/responses/admin-product-list-response.dto';

import { CreateProductService } from '../services/admin/create-product.service';
import { DeleteProductService } from '../services/admin/delete-product.service';
import { GetAdminProductDetailsService } from '../services/admin/get-admin-product-details.service';
import { GetAdminProductsService } from '../services/admin/get-admin-products.service';
import { RestoreProductService } from '../services/admin/restore-product.service';
import { UpdateProductService } from '../services/admin/update-product.service';

@ApiTags('Admin - Products')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductsController {
  constructor(
    private readonly createProductService: CreateProductService,
    private readonly getAdminProductsService: GetAdminProductsService,
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
    private readonly restoreProductService: RestoreProductService,
  ) {}

  @Post()
  @Permissions(Permission.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ type: AdminProductDetailResponseDto })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<AdminProductDetailResponseDto> {
    return this.createProductService.execute(dto, userId);
  }

  @Get()
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get paginated admin products' })
  @ApiOkResponse({ type: AdminProductListResponseDto })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<AdminProductListResponseDto> {
    return this.getAdminProductsService.execute(query);
  }

  @Get(':productId/details')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get admin product details' })
  @ApiParam({
    name: 'productId',
    example: 'cm123product456',
  })
  @ApiOkResponse({ type: AdminProductDetailResponseDto })
  async findOne(
    @Param('productId') productId: string,
  ): Promise<AdminProductDetailResponseDto> {
    return this.getAdminProductDetailsService.execute(productId);
  }

  @Patch(':productId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({
    name: 'productId',
    example: 'cm123product456',
  })
  @ApiOkResponse({ type: AdminProductDetailResponseDto })
  async update(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<AdminProductDetailResponseDto> {
    return this.updateProductService.execute(productId, dto, userId);
  }

  @Delete(':productId')
  @Permissions(Permission.PRODUCT_DELETE)
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiParam({
    name: 'productId',
    example: 'cm123product456',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Product deleted successfully',
      },
    },
  })
  async remove(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.deleteProductService.execute(productId, userId);
  }

  @Patch(':productId/restore')
  @Permissions(Permission.PRODUCT_RESTORE)
  @ApiOperation({ summary: 'Restore a soft-deleted product' })
  @ApiParam({
    name: 'productId',
    example: 'cm123product456',
  })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Product restored successfully',
      },
    },
  })
  async restore(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.restoreProductService.execute(productId, userId);
  }
}
