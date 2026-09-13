import { Module } from '@nestjs/common';

// Other Modules
import { StockMovementModule } from '../inventory/stock-movements/stock-movement.module';

import { PurchaseController } from './controllers/purchase.controller';
import { PurchaseReturnController } from './controllers/purchase-return.controller';

// Purchase Services
import { CancelPurchaseService } from './services/cancel-purchase.service';
import { CreatePurchaseService } from './services/create-purchase.service';
import { GetPurchaseService } from './services/get-purchase.service';
import { GetPurchasesService } from './services/get-purchases.service';
import { ReceivePurchaseService } from './services/receive-purchase.service';
import { UpdatePurchaseService } from './services/update-purchase.service';

// Purchase Return Services
import { CreatePurchaseReturnService } from './services/create-purchase-return.service';
import { GetPurchaseReturnService } from './services/get-purchase-return.service';
import { GetPurchaseReturnsService } from './services/get-purchase-returns.service';

@Module({
    imports: [
        StockMovementModule,
    ],

    controllers: [
        PurchaseController,
        PurchaseReturnController,
    ],

    providers: [
        // Purchase Services
        CancelPurchaseService,
        CreatePurchaseService,
        GetPurchaseService,
        GetPurchasesService,
        ReceivePurchaseService,
        UpdatePurchaseService,

        // Purchase Return Services
        CreatePurchaseReturnService,
        GetPurchaseReturnService,
        GetPurchaseReturnsService,
    ],
})
export class PurchaseModule { }