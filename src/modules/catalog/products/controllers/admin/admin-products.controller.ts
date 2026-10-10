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

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { Permission } from '@/lib/prisma/enums';

import { CreateProductDto } from '../../dto/requests/create-product.dto';
import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import { UpdateProductDto } from '../../dto/requests/update-product.dto';
import { AdminProductListResponseDto } from '../../dto/responses/admin-product-list-response.dto';
import { ProductDetailResponseDto } from '../../dto/responses/product-detail-response.dto';

import { CreateProductService } from '../../services/admin/create-product.service';
import { GetAdminProductsService } from '../../services/admin/get-admin-products.service';
import { GetAdminProductDetailsService } from '../../services/admin/get-admin-product-details.service';
import { UpdateProductService } from '../../services/admin/update-product.service';
import { DeleteProductService } from '../../services/admin/delete-product.service';

@ApiTags('Admin Products')
@Controller('admin/products')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class AdminProductsController {
  constructor(
    private readonly createProductService: CreateProductService,
    private readonly getAdminProductsService: GetAdminProductsService,
    private readonly getAdminProductDetailsService: GetAdminProductDetailsService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
  ) {}

  @Post()
  @Permissions(Permission.PRODUCT_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProductDetailResponseDto })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductDetailResponseDto> {
    return this.createProductService.execute(userId, dto);
  }

  @Get()
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'List products for admin' })
  @ApiResponse({ status: HttpStatus.OK, type: AdminProductListResponseDto })
  async findAll(@Query() query: ProductQueryDto): Promise<AdminProductListResponseDto> {
    return this.getAdminProductsService.execute(query);
  }

  @Get(':id')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get product details for admin' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductDetailResponseDto })
  async findOne(@Param('id') id: string): Promise<ProductDetailResponseDto> {
    return this.getAdminProductDetailsService.execute(id);
  }

  @Patch(':id')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: HttpStatus.OK, type: ProductDetailResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductDetailResponseDto> {
    return this.updateProductService.execute(userId, id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.PRODUCT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteProductService.execute(id);
  }
}
