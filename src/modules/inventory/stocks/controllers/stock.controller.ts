import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../../../../common/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard.js';
import { UserJwtAuthGuard } from '../../../../common/guards/user-jwt-auth.guard.js';
import { Permission } from '../../../../infrastructure/database/generated/prisma/enums.js';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator.js';

// DTOs
import { AdjustStockDto } from '../dto/requests/adjust-stock.dto.js';
import { StockQueryDto } from '../dto/requests/stock-query.dto.js';
import {
  StockListResponseDto,
  StockResponseDto,
} from '../dto/responses/stock-response.dto.js';

// Services
import { AdjustStockService } from '../services/adjust-stock.service.js';
import { GetStockService } from '../services/get-stock.service.js';
import { GetStocksService } from '../services/get-stocks.service.js';

@ApiTags('Stocks')
@Controller('stocks')
@UseGuards(UserJwtAuthGuard, PermissionsGuard)
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
  @Permissions(Permission.STOCK_UPDATE)
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
  @Permissions(Permission.STOCK_READ)
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
  @Permissions(Permission.STOCK_READ)
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
