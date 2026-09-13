import { Module } from '@nestjs/common';

import { StockMovementController } from './controllers/stock-movement.controller';

// Services
import { CreateStockMovementService } from './services/create-stock-movement.service';
import { GetStockMovementService } from './services/get-stock-movement.service';
import { GetStockMovementsService } from './services/get-stock-movements.service';

@Module({
    controllers: [StockMovementController],

    providers: [
        CreateStockMovementService,
        GetStockMovementService,
        GetStockMovementsService,
    ],

    exports: [CreateStockMovementService],
})
export class StockMovementModule { }
