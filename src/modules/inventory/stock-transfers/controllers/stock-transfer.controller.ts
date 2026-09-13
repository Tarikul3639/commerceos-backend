import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';

// DTOs
import { CreateStockTransferDto } from '../dto/requests/create-stock-transfer.dto';
import { StockTransferQueryDto } from '../dto/requests/stock-transfer-query.dto';
import { UpdateStockTransferDto } from '../dto/requests/update-stock-transfer.dto';
import { UpdateStockTransferStatusDto } from '../dto/requests/update-stock-transfer-status.dto';

// Services
import { CreateStockTransferService } from '../services/create-stock-transfer.service';
import { GetStockTransferService } from '../services/get-stock-transfer.service';
import { GetStockTransfersService } from '../services/get-stock-transfers.service';
import { UpdateStockTransferService } from '../services/update-stock-transfer.service';
import { UpdateStockTransferStatusService } from '../services/update-stock-transfer-status.service';
import { CancelStockTransferService } from '../services/cancel-stock-transfer.service';

// Current User
import { CurrentUser } from '@/common/decorators/current-user.decorator';

import type { CurrentUserPayload } from '@/common/interfaces/current-user.interface';

@ApiTags('Stock Transfers')
@Controller('stock-transfers')
export class StockTransferController {
    constructor(
        private readonly createStockTransferService: CreateStockTransferService,

        private readonly getStockTransferService: GetStockTransferService,

        private readonly getStockTransfersService: GetStockTransfersService,

        private readonly updateStockTransferService: UpdateStockTransferService,

        private readonly updateStockTransferStatusService: UpdateStockTransferStatusService,

        private readonly cancelStockTransferService: CancelStockTransferService,
    ) {}

    /**
     * Create stock transfer
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new stock transfer',
    })
    async create(
        @Body()
        createStockTransferDto: CreateStockTransferDto,

        @CurrentUser()
        user: CurrentUserPayload,
    ) {
        const stockTransfer =
            await this.createStockTransferService.execute(
                user.id,
                createStockTransferDto,
            );

        return {
            message:
                'Stock transfer created successfully',

            data: stockTransfer,
        };
    }

    /**
     * Get all stock transfers
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all stock transfers',
    })
    async findAll(
        @Query()
        query: StockTransferQueryDto,
    ) {
        return this.getStockTransfersService.execute(
            query,
        );
    }

    /**
     * Get stock transfer by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get stock transfer by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'Stock transfer ID',
    })
    async findOne(
        @Param('id')
        stockTransferId: string,
    ) {
        const stockTransfer =
            await this.getStockTransferService.execute(
                stockTransferId,
            );

        return {
            data: stockTransfer,
        };
    }

    /**
     * Update stock transfer
     *
     * Only PENDING stock transfers
     * can be updated.
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update a pending stock transfer',
    })
    @ApiParam({
        name: 'id',
        description: 'Stock transfer ID',
    })
    async update(
        @Param('id')
        stockTransferId: string,

        @Body()
        updateStockTransferDto: UpdateStockTransferDto,
    ) {
        const stockTransfer =
            await this.updateStockTransferService.execute(
                stockTransferId,
                updateStockTransferDto,
            );

        return {
            message:
                'Stock transfer updated successfully',

            data: stockTransfer,
        };
    }

    /**
     * Complete stock transfer
     *
     * This will:
     *
     * 1. Decrease stock from source warehouse
     * 2. Create TRANSFER_OUT stock movement
     * 3. Increase stock in destination warehouse
     * 4. Create TRANSFER_IN stock movement
     * 5. Mark transfer as COMPLETED
     */
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Complete a stock transfer',
    })
    @ApiParam({
        name: 'id',
        description: 'Stock transfer ID',
    })
    async updateStatus(
        @Param('id')
        stockTransferId: string,

        @Body()
        updateStockTransferStatusDto: UpdateStockTransferStatusDto,
    ) {
        const stockTransfer =
            await this.updateStockTransferStatusService.execute(
                stockTransferId,
                updateStockTransferStatusDto,
            );

        return {
            message:
                'Stock transfer completed successfully',

            data: stockTransfer,
        };
    }

    /**
     * Cancel stock transfer
     *
     * Only PENDING stock transfers
     * can be cancelled.
     *
     * No inventory changes are made.
     */
    @Patch(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cancel a pending stock transfer',
    })
    @ApiParam({
        name: 'id',
        description: 'Stock transfer ID',
    })
    async cancel(
        @Param('id')
        stockTransferId: string,
    ) {
        const stockTransfer =
            await this.cancelStockTransferService.execute(
                stockTransferId,
            );

        return {
            message:
                'Stock transfer cancelled successfully',

            data: stockTransfer,
        };
    }
}