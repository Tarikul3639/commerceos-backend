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

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@/common/interfaces/current-user.interface';

// DTOs
import { AdjustStockDto } from '../dto/requests/adjust-stock.dto';
import { StockQueryDto } from '../dto/requests/stock-query.dto';

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
    ) { }

    /**
     * Adjust stock quantity
     */
    @Post('adjust')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Adjust stock quantity',
    })
    async adjust(
        @Body()
        adjustStockDto: AdjustStockDto,

        @CurrentUser()
        user: CurrentUserPayload,
    ) {
        const stock = await this.adjustStockService.execute(
            user.id,
            adjustStockDto,
        );

        return {
            message: 'Stock adjusted successfully',
            data: stock,
        };
    }

    /**
     * Get all stocks
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all stocks',
    })
    async findAll(
        @Query()
        query: StockQueryDto,
    ) {
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
        description: 'Inventory ID',
    })
    async findOne(
        @Param('id')
        inventoryId: string,
    ) {
        const stock = await this.getStockService.execute(inventoryId);

        return {
            data: stock,
        };
    }
}
