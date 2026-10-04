import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { PurchaseReturnController } from '@/modules/purchase-return/purchase-return.controller';
import { CreatePurchaseReturnService } from '@/modules/purchase-return/services/create-purchase-return.service';
import { GetPurchaseReturnService } from '@/modules/purchase-return/services/get-purchase-return.service';
import { GetPurchaseReturnsService } from '@/modules/purchase-return/services/get-purchase-returns.service';
import { PurchaseReturnActionsService } from '@/modules/purchase-return/services/purchase-return-actions.service';

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
