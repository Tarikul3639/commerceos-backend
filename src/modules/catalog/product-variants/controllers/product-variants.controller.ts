import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';
import { Permissions } from '../../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../../infrastructure/database/generated/prisma/enums.js';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProductVariantDto } from '../dto/requests/create-product-variant.dto.js';
import { UpdateProductVariantDto } from '../dto/requests/update-product-variant.dto.js';
import { ProductVariantResponseDto } from '../dto/responses/product-variant-response.dto.js';

import { CreateProductVariantService } from '../services/create-product-variant.service.js';
import { DeleteProductVariantService } from '../services/delete-product-variant.service.js';
import { GetProductVariantsService } from '../services/get-product-variants.service.js';
import { UpdateProductVariantService } from '../services/update-product-variant.service.js';

@ApiTags('Product Variants')
@Controller('admin/product-variants')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class ProductVariantsController {
  constructor(
    private readonly createProductVariantService: CreateProductVariantService,
    private readonly getProductVariantsService: GetProductVariantsService,
    private readonly updateProductVariantService: UpdateProductVariantService,
    private readonly deleteProductVariantService: DeleteProductVariantService,
  ) {}

  @Post()
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Create a product variant' })
  @ApiCreatedResponse({ type: ProductVariantResponseDto })
  async create(
    @Body() dto: CreateProductVariantDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductVariantResponseDto> {
    return this.createProductVariantService.execute(dto, userId);
  }

  @Get(':productId')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get all variants for a product' })
  @ApiOkResponse({
    type: ProductVariantResponseDto,
    isArray: true,
  })
  async getAll(
    @Param('productId') productId: string,
  ): Promise<ProductVariantResponseDto[]> {
    return this.getProductVariantsService.execute(productId);
  }

  @Patch(':variantId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a product variant' })
  @ApiOkResponse({ type: ProductVariantResponseDto })
  async update(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductVariantResponseDto> {
    return this.updateProductVariantService.execute(variantId, dto, userId);
  }

  @Delete(':variantId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Soft delete a product variant' })
  @ApiOkResponse({ type: ProductVariantResponseDto })
  async remove(
    @Param('variantId') variantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ProductVariantResponseDto> {
    return this.deleteProductVariantService.execute(variantId, userId);
  }
}
