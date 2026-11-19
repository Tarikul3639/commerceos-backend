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

import { AddProductImageDto } from '../dto/requests/add-product-image.dto.js';
import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto.js';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto.js';

import { AddProductImageService } from '../services/add-product-image.service.js';
import { DeleteProductImageService } from '../services/delete-product-image.service.js';
import { GetProductImagesService } from '../services/get-product-images.service.js';
import { UpdateProductImageService } from '../services/update-product-image.service.js';

@ApiTags('Product Images')
@Controller('admin/product-images')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
export class ProductImagesController {
  constructor(
    private readonly addProductImageService: AddProductImageService,
    private readonly getProductImagesService: GetProductImagesService,
    private readonly updateProductImageService: UpdateProductImageService,
    private readonly deleteProductImageService: DeleteProductImageService,
  ) {}

  @Post(':productId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Add multiple images to a product' })
  @ApiParam({ name: 'productId', type: String })
  @ApiCreatedResponse({ type: [ProductImageResponseDto] })
  async add(
    @Param('productId') productId: string,
    @Body() dto: AddProductImageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductImageResponseDto[]> {
    return this.addProductImageService.execute(productId, dto, userId);
  }

  @Get(':productId')
  @Permissions(Permission.PRODUCT_READ)
  @ApiOperation({ summary: 'Get all images of a product' })
  @ApiOkResponse({
    type: ProductImageResponseDto,
    isArray: true,
  })
  async getAll(
    @Param('productId') productId: string,
  ): Promise<ProductImageResponseDto[]> {
    return this.getProductImagesService.execute(productId);
  }

  @Patch(':imageId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Update a product image' })
  @ApiOkResponse({ type: ProductImageResponseDto })
  async update(
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProductImageResponseDto> {
    return this.updateProductImageService.execute(imageId, dto, userId);
  }

  @Delete(':imageId')
  @Permissions(Permission.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiOkResponse({ description: 'Product image deleted successfully' })
  async remove(
    @Param('imageId') imageId: string,
    @CurrentUser('id') userId: string,
  ): Promise<ProductImageResponseDto> {
    return this.deleteProductImageService.execute(imageId, userId);
  }
}
