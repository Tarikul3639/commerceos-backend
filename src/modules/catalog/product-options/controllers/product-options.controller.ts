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
import { Permission } from '../../../../lib/prisma/enums.js';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateProductOptionDto } from '../dto/requests/create-product-option.dto.js';
import { UpdateProductOptionDto } from '../dto/requests/update-product-option.dto.js';
import { ProductOptionResponseDto } from '../dto/responses/product-option-response.dto.js';
import { ProductVariantResponseDto } from '../../product-variants/dto/responses/product-variant-response.dto.js';

import { CreateProductOptionService } from '../services/create-product-option.service.js';
import { DeleteProductOptionService } from '../services/delete-product-option.service.js';
import { GenerateProductVariantsService } from '../services/generate-product-variants.service.js';
import { GetProductOptionsService } from '../services/get-product-options.service.js';
import { UpdateProductOptionService } from '../services/update-product-option.service.js';

@ApiTags('Admin - Product Options')
@Controller('admin/product-options')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class ProductOptionsController {
  constructor(
    private readonly createProductOptionService: CreateProductOptionService,
    private readonly getProductOptionsService: GetProductOptionsService,
    private readonly updateProductOptionService: UpdateProductOptionService,
    private readonly deleteProductOptionService: DeleteProductOptionService,
    private readonly generateProductVariantsService: GenerateProductVariantsService,
  ) {}

  @Post()
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Create a product option with values' })
  @ApiCreatedResponse({ type: ProductOptionResponseDto })
  async create(
    @Body() dto: CreateProductOptionDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductOptionResponseDto> {
    return this.createProductOptionService.execute(dto, userId);
  }

  @Get(':productId')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get all options for a product' })
  @ApiParam({ name: 'productId', example: 'cm123product456' })
  @ApiOkResponse({ type: ProductOptionResponseDto, isArray: true })
  async findAll(
    @Param('productId') productId: string,
  ): Promise<ProductOptionResponseDto[]> {
    return this.getProductOptionsService.execute(productId);
  }

  @Patch(':optionId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a product option' })
  @ApiParam({ name: 'optionId', example: 'cm123coloroption' })
  @ApiOkResponse({ type: ProductOptionResponseDto })
  async update(
    @Param('optionId') optionId: string,
    @Body() dto: UpdateProductOptionDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductOptionResponseDto> {
    return this.updateProductOptionService.execute(optionId, dto, userId);
  }

  @Delete(':optionId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Delete a product option' })
  @ApiParam({ name: 'optionId', example: 'cm123coloroption' })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Product option deleted successfully',
      },
    },
  })
  async remove(
    @Param('optionId') optionId: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.deleteProductOptionService.execute(optionId, userId);
  }

  @Post(':productId/generate-variants')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Generate product variants from all option combinations',
  })
  @ApiParam({ name: 'productId', example: 'cm123product456' })
  @ApiCreatedResponse({ type: ProductVariantResponseDto, isArray: true })
  async generateVariants(
    @Param('productId') productId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ProductVariantResponseDto[]> {
    return this.generateProductVariantsService.execute(productId, userId);
  }
}
