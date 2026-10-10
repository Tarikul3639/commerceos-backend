import { Controller, Get, Param } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StoreProductDetailResponseDto } from '../../dto/responses/store-product-detail-response.dto';
import { GetStoreProductDetailsService } from '../../services/store/get-store-product-details.service';

@ApiTags('Store Products')
@Controller('store/products')
export class StoreProductDetailsController {
  constructor(
    private readonly getStoreProductDetailsService: GetStoreProductDetailsService,
  ) {}

  @Get(':id/details')
  @ApiOperation({ summary: 'Get product detail summary' })
  @ApiResponse({ status: 200, type: StoreProductDetailResponseDto })
  async details(@Param('id') id: string): Promise<StoreProductDetailResponseDto> {
    return this.getStoreProductDetailsService.execute(id);
  }
}
