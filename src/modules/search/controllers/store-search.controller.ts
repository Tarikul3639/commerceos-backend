import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ProductSearchQueryDto } from '../dto/requests/product-search-query.dto.js';
import { ProductSearchResponseDto } from '../dto/responses/product-search-response.dto.js';
import { StoreProductSearchService } from '../services/store-product-search.service.js';

@ApiTags('Store - Search')
@Controller('search/products')
export class StoreSearchController {
  constructor(
    private readonly storeProductSearchService: StoreProductSearchService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search published storefront products',
  })
  @ApiOkResponse({ type: ProductSearchResponseDto })
  search(
    @Query() query: ProductSearchQueryDto,
  ): Promise<ProductSearchResponseDto> {
    return this.storeProductSearchService.execute(query);
  }
}
