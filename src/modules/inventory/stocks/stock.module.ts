import { Module } from '@nestjs/common';

import { StockController } from './controllers/stock.controller';

// Services
import { AdjustStockService } from './services/adjust-stock.service';
import { GetStockService } from './services/get-stock.service';
import { GetStocksService } from './services/get-stocks.service';

@Module({
  controllers: [StockController],

  providers: [AdjustStockService, GetStockService, GetStocksService],

  exports: [],
})
export class StockModule {}
