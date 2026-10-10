import { Controller, Get, Param, Query } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProductQueryDto } from '../../dto/requests/product-query.dto';
import { StoreProductListResponseDto } from '../../dto/responses/store-product-list-response.dto';
import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto';
import { GetStoreProductsService } from '../../services/store/get-store-products.service';
import { GetStoreProductDetailsService } from '../../services/store/get-store-product-details.service';

@ApiTags('Store Products')
@Controller('store/products')
export class StoreProductsController {
  constructor(
    private readonly getStoreProductsService: GetStoreProductsService,
    private readonly getStoreProductDetailsService: GetStoreProductDetailsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List store products' })
  @ApiResponse({ status: 200, type: StoreProductListResponseDto })
  async findAll(@Query() query: ProductQueryDto): Promise<StoreProductListResponseDto> {
    return this.getStoreProductsService.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store product details' })
  @ApiResponse({ status: 200, type: StoreProductDetailResponseDto })
  async findOne(@Param('id') id: string): Promise<StoreProductDetailResponseDto> {
    return this.getStoreProductDetailsService.execute(id);
  }
}
