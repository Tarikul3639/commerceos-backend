
import { Controller, Get, Param, Query } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

import { ProductQueryDto } from '../dto/requests/product-query.dto';
import { StoreProductDetailResponseDto } from '../dto/responses/store-product-detail-response.dto';
import { StoreProductListResponseDto } from '../dto/responses/store-product-list-response.dto';

import { GetStoreProductDetailsService } from '../services/store/get-store-product-details.service';
import { GetStoreProductsService } from '../services/store/get-store-products.service';

@ApiTags('Store - Products')
@Controller('store/products')
export class StoreProductsController {
    constructor(
        private readonly getStoreProductsService: GetStoreProductsService,
        private readonly getStoreProductDetailsService: GetStoreProductDetailsService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get published products for the store' })
    @ApiOkResponse({ type: StoreProductListResponseDto })
    async findAll(
        @Query() query: ProductQueryDto,
    ): Promise<StoreProductListResponseDto> {
        return this.getStoreProductsService.execute(query);
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
