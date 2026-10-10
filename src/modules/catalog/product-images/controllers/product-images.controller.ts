import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AddProductImageDto } from '../dto/requests/add-product-image.dto';
import { UpdateProductImageDto } from '../dto/requests/update-product-image.dto';
import { ProductImageResponseDto } from '../dto/responses/product-image-response.dto';

import { AddProductImageService } from '../services/add-product-image.service';
import { DeleteProductImageService } from '../services/delete-product-image.service';
import { GetProductImagesService } from '../services/get-product-images.service';
import { UpdateProductImageService } from '../services/update-product-image.service';

@ApiTags('Product Images')
@Controller('admin/product-images')
export class ProductImagesController {
  constructor(
    private readonly addProductImageService: AddProductImageService,
    private readonly getProductImagesService: GetProductImagesService,
    private readonly updateProductImageService: UpdateProductImageService,
    private readonly deleteProductImageService: DeleteProductImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add multiple images to a product' })
  @ApiCreatedResponse({ type: [ProductImageResponseDto] })
  async add(
    @Body() dto: AddProductImageDto,
  ): Promise<ProductImageResponseDto[]> {
    return this.addProductImageService.execute(dto);
  }

  @Get(':productId')
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
  @ApiOperation({ summary: 'Update a product image' })
  @ApiOkResponse({ type: ProductImageResponseDto })
  async update(
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ): Promise<ProductImageResponseDto> {
    return this.updateProductImageService.execute(imageId, dto);
  }

  @Delete(':imageId')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiOkResponse({ description: 'Product image deleted successfully' })
  async remove(
    @Param('imageId') imageId: string,
  ): Promise<ProductImageResponseDto> {
    return this.deleteProductImageService.execute(imageId);
  }
}
