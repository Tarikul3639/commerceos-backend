import { Module } from '@nestjs/common';

import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { PurchaseController } from './purchase.controller';
import { CancelPurchaseService } from './services/cancel-purchase.service';
import { CreatePurchaseService } from './services/create-purchase.service';
import { DeletePurchaseService } from './services/delete-purchase.service';
import { GetPurchaseService } from './services/get-purchase.service';
import { GetPurchasesService } from './services/get-purchases.service';
import { ReceivePurchaseService } from './services/receive-purchase.service';
import { UpdatePurchaseService } from './services/update-purchase.service';

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
