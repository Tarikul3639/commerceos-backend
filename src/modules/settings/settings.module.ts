import { Module } from '@nestjs/common';

import { PrismaModule } from '@/common/prisma/prisma.module';

import { SettingsController } from './controllers/settings.controller';
import { ShippingSettingsController } from './controllers/shipping-settings.controller';
import { NotificationPreferencesController } from './controllers/notification-preferences.controller';
import { PaymentGatewayController } from './controllers/payment-gateway.controller';

// Services
import { GetSettingsService } from './services/get-settings.service';
import { UpdateSettingsService } from './services/update-settings.service';
import { ShippingSettingsService } from './services/shipping-settings.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { PaymentGatewayService } from './services/payment-gateway.service';

@Module({
  imports: [PrismaModule],

  controllers: [
    SettingsController,
    ShippingSettingsController,
    NotificationPreferencesController,
    PaymentGatewayController,
  ],

  providers: [
    GetSettingsService,
    UpdateSettingsService,
    ShippingSettingsService,
    NotificationPreferencesService,
    PaymentGatewayService,
  ],

  exports: [
    GetSettingsService,
    UpdateSettingsService,
    ShippingSettingsService,
    NotificationPreferencesService,
  ],
})
export class SettingsModule {}
