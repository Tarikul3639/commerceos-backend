import { Module } from '@nestjs/common';

import { StockController } from './controllers/stock.controller';

// Services
import { AdjustStockService } from './services/adjust-stock.service';
import { GetStockService } from './services/get-stock.service';
import { GetStocksService } from './services/get-stocks.service';
import { ReleaseStockService } from './services/release-stock.service';
import { ReserveStockService } from './services/reserve-stock.service';

@Module({
    controllers: [StockController],

    providers: [
        AdjustStockService,
        GetStockService,
        GetStocksService,
        ReserveStockService,
        ReleaseStockService,
    ],

    exports: [ReserveStockService, ReleaseStockService],
})
export class StockModule { }
