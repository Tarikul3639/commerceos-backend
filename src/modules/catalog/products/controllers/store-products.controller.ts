import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ProductQueryDto } from '../dto/requests/product-query.dto.js';
import { StorefrontNewArrivalsQueryDto } from '../dto/requests/storefront-new-arrivals-query.dto.js';
import { StoreProductDetailResponseDto } from '../dto/responses/store-product-detail-response.dto.js';
import { StoreProductListResponseDto } from '../dto/responses/store-product-list-response.dto.js';

import { GetStoreProductDetailsService } from '../services/store/get-store-product-details.service.js';
import { GetStoreProductsService } from '../services/store/get-store-products.service.js';
import { GetStoreNewArrivalsService } from '../services/store/get-store-new-arrivals.service.js';
import { GetStoreBestSellersService } from '../services/store/get-store-best-sellers.service.js';

@ApiTags('Store - Products')
@Controller('store/products')
export class StoreProductsController {
  constructor(
    private readonly getStoreProductsService: GetStoreProductsService,
    private readonly getStoreProductDetailsService: GetStoreProductDetailsService,
    private readonly getStoreNewArrivalsService: GetStoreNewArrivalsService,
    private readonly getStoreBestSellersService: GetStoreBestSellersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get published products for the store' })
  @ApiOkResponse({ type: StoreProductListResponseDto })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<StoreProductListResponseDto> {
    return this.getStoreProductsService.execute(query);
  }

  @Get('new-arrivals')
  @ApiOperation({
    summary:
      'Get the latest non-featured published products for the storefront homepage',
  })
  @ApiOkResponse({ type: StoreProductListResponseDto })
  async findNewArrivals(
    @Query() query: StorefrontNewArrivalsQueryDto,
  ): Promise<StoreProductListResponseDto> {
    return this.getStoreNewArrivalsService.execute(query);
  }

  @Get('best-sellers')
  @ApiOperation({
    summary:
      'Get best-selling published products based on paid order quantities',
  })
  @ApiOkResponse({ type: StoreProductListResponseDto })
  async findBestSellers(
    @Query() query: StorefrontNewArrivalsQueryDto,
  ): Promise<StoreProductListResponseDto> {
    return this.getStoreBestSellersService.execute(query);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get published product details' })
  @ApiParam({
    name: 'productId',
    example: 'cm123product456',
  })
  @ApiOkResponse({ type: StoreProductDetailResponseDto })
  async findOne(
    @Param('productId') productId: string,
  ): Promise<StoreProductDetailResponseDto> {
    return this.getStoreProductDetailsService.execute(productId);
  }
}
