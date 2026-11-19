import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../infrastructure/database/database.module.js';

import { SettingsController } from './controllers/settings.controller.js';
import { ShippingSettingsController } from './controllers/shipping-settings.controller.js';
import { NotificationPreferencesController } from './controllers/notification-preferences.controller.js';
import { PaymentGatewayController } from './controllers/payment-gateway.controller.js';
import { SecuritySettingsController } from './controllers/security-settings.controller.js';

// Services
import { GetSettingsService } from './services/get-settings.service.js';
import { UpdateSettingsService } from './services/update-settings.service.js';
import { ShippingSettingsService } from './services/shipping-settings.service.js';
import { NotificationPreferencesService } from './services/notification-preferences.service.js';
import { PaymentGatewayService } from './services/payment-gateway.service.js';
import { SecuritySettingsService } from './services/security-settings.service.js';

@Module({
  imports: [DatabaseModule],

  controllers: [
    SettingsController,
    ShippingSettingsController,
    NotificationPreferencesController,
    PaymentGatewayController,
    SecuritySettingsController,
  ],

  providers: [
    GetSettingsService,
    UpdateSettingsService,
    ShippingSettingsService,
    NotificationPreferencesService,
    PaymentGatewayService,
    SecuritySettingsService,
  ],

  exports: [
    GetSettingsService,
    UpdateSettingsService,
    ShippingSettingsService,
    NotificationPreferencesService,
    SecuritySettingsService,
  ],
})
export class SettingsModule {}
