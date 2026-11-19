import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { PurchaseReturnController } from './purchase-return.controller.js';
import { CreatePurchaseReturnService } from './services/create-purchase-return.service.js';
import { GetPurchaseReturnService } from './services/get-purchase-return.service.js';
import { GetPurchaseReturnsService } from './services/get-purchase-returns.service.js';
import { PurchaseReturnActionsService } from './services/purchase-return-actions.service.js';

@Module({
  controllers: [PurchaseReturnController],
  providers: [
    CreatePurchaseReturnService,
    GetPurchaseReturnService,
    GetPurchaseReturnsService,
    PurchaseReturnActionsService,
    UserJwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class PurchaseReturnModule {}
