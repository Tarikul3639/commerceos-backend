import { Module } from '@nestjs/common';

import { StockTransferController } from './controllers/stock-transfer.controller';

// Services
import { CancelStockTransferService } from './services/cancel-stock-transfer.service';
import { CreateStockTransferService } from './services/create-stock-transfer.service';
import { GetStockTransferService } from './services/get-stock-transfer.service';
import { GetStockTransfersService } from './services/get-stock-transfers.service';
import { UpdateStockTransferService } from './services/update-stock-transfer.service';
import { UpdateStockTransferStatusService } from './services/update-stock-transfer-status.service';

@Module({
    controllers: [StockTransferController],

    providers: [
        CreateStockTransferService,
        GetStockTransferService,
        GetStockTransfersService,
        UpdateStockTransferService,
        UpdateStockTransferStatusService,
        CancelStockTransferService,
    ],

    exports: [
        CreateStockTransferService,
        GetStockTransferService,
        GetStockTransfersService,
        UpdateStockTransferService,
        UpdateStockTransferStatusService,
        CancelStockTransferService,
    ],
})
export class StockTransferModule { }
