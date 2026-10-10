import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

// DTOs
import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';
import { StockQueryDto } from '../dto/requests/stock-query.dto';
import {
  StockListResponseDto,
  StockResponseDto,
} from '../dto/responses/stock-response.dto';

// Services
import { AdjustStockService } from '../services/adjust-stock.service';
import { GetStockService } from '../services/get-stock.service';
import { GetStocksService } from '../services/get-stocks.service';

@ApiTags('Stocks')
@Controller('stocks')
export class StockController {
  constructor(
    private readonly adjustStockService: AdjustStockService,
    private readonly getStockService: GetStockService,
    private readonly getStocksService: GetStocksService,
  ) {}

  /**
   * Adjust stock quantity
   */
  @Post('adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Adjust stock quantity',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock adjusted successfully',
    type: StockResponseDto,
  })
  async adjust(
    @Body() adjustStockDto: AdjustStockDto,
    @CurrentUser('id') userId: string,
  ): Promise<StockResponseDto> {
    return await this.adjustStockService.execute(userId, adjustStockDto);
  }

  /**
   * Get all stocks
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all stocks',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of stocks',
    type: StockListResponseDto,
  })
  async findAll(@Query() query: StockQueryDto): Promise<StockListResponseDto> {
    return this.getStocksService.execute(query);
  }

  /**
   * Get stock by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get stock by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock details',
    type: StockResponseDto,
  })
  async findOne(@Param('id') variantId: string): Promise<StockResponseDto> {
    return await this.getStockService.execute(variantId);
  }
}
