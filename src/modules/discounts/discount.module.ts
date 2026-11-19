import { Module } from '@nestjs/common';
import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { DiscountController } from './controllers/discount.controller.js';
import { DiscountService } from './services/discount.service.js';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, UserJwtAuthGuard, PermissionsGuard],
})
export class DiscountModule {}
