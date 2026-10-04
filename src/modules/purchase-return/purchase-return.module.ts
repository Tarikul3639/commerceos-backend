import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { PurchaseReturnController } from './purchase-return.controller';
import { CreatePurchaseReturnService } from './services/create-purchase-return.service';
import { GetPurchaseReturnService } from './services/get-purchase-return.service';
import { GetPurchaseReturnsService } from './services/get-purchase-returns.service';
import { PurchaseReturnActionsService } from './services/purchase-return-actions.service';

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
