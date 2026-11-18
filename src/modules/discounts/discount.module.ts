import { Module } from '@nestjs/common';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { DiscountController } from './controllers/discount.controller';
import { DiscountService } from './services/discount.service';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, UserJwtAuthGuard, PermissionsGuard],
})
export class DiscountModule {}
