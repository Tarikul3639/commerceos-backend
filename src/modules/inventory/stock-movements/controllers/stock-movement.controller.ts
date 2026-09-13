import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

// DTOs
import { StockMovementQueryDto } from '../dto/requests/stock-movement-query.dto';

// Services
import { GetStockMovementService } from '../services/get-stock-movement.service';
import { GetStockMovementsService } from '../services/get-stock-movements.service';

@ApiTags('Stock Movements')
@Controller('stock-movements')
export class StockMovementController {
    constructor(
        private readonly getStockMovementService: GetStockMovementService,

        private readonly getStockMovementsService: GetStockMovementsService,
    ) { }

    /**
     * Get all stock movements
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all stock movements',
    })
    async findAll(
        @Query()
        query: StockMovementQueryDto,
    ) {
        return this.getStockMovementsService.execute(query);
    }

    /**
     * Get stock movement by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get stock movement by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Stock movement ID',
    })
    async findOne(
        @Param('id')
        stockMovementId: string,
    ) {
        const stockMovement =
            await this.getStockMovementService.execute(stockMovementId);

        return {
            data: stockMovement,
        };
    }
}
