import { Module } from '@nestjs/common';

import { StockController } from '@/modules/inventory/stocks/controllers/stock.controller';

// Services
import { AdjustStockService } from '@/modules/inventory/stocks/services/adjust-stock.service';
import { GetStockService } from '@/modules/inventory/stocks/services/get-stock.service';
import { GetStocksService } from '@/modules/inventory/stocks/services/get-stocks.service';

@Module({
  controllers: [StockController],

  providers: [AdjustStockService, GetStockService, GetStocksService],

  exports: [],
})
export class StockModule {}
