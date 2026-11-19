import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { PurchaseController } from './purchase.controller.js';
import { CancelPurchaseService } from './services/cancel-purchase.service.js';
import { CreatePurchaseService } from './services/create-purchase.service.js';
import { DeletePurchaseService } from './services/delete-purchase.service.js';
import { GetPurchaseService } from './services/get-purchase.service.js';
import { GetPurchasesService } from './services/get-purchases.service.js';
import { ReceivePurchaseService } from './services/receive-purchase.service.js';
import { UpdatePurchaseService } from './services/update-purchase.service.js';

@Module({
  controllers: [PurchaseController],
  providers: [
    CancelPurchaseService,
    CreatePurchaseService,
    DeletePurchaseService,
    GetPurchaseService,
    GetPurchasesService,
    ReceivePurchaseService,
    UpdatePurchaseService,
    UserJwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class PurchaseModule {}
