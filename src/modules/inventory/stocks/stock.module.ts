import { Module } from '@nestjs/common';

import { StockController } from './controllers/stock.controller.js';

// Services
import { AdjustStockService } from './services/adjust-stock.service.js';
import { GetStockService } from './services/get-stock.service.js';
import { GetStocksService } from './services/get-stocks.service.js';

@Module({
  controllers: [StockController],

  providers: [AdjustStockService, GetStockService, GetStocksService],

  exports: [],
})
export class StockModule {}
