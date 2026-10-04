import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { PurchaseController } from '@/modules/purchases/purchase.controller';
import { CancelPurchaseService } from '@/modules/purchases/services/cancel-purchase.service';
import { CreatePurchaseService } from '@/modules/purchases/services/create-purchase.service';
import { DeletePurchaseService } from '@/modules/purchases/services/delete-purchase.service';
import { GetPurchaseService } from '@/modules/purchases/services/get-purchase.service';
import { GetPurchasesService } from '@/modules/purchases/services/get-purchases.service';
import { ReceivePurchaseService } from '@/modules/purchases/services/receive-purchase.service';
import { UpdatePurchaseService } from '@/modules/purchases/services/update-purchase.service';

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
