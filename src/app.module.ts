import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Configs
import {
  appConfig,
  authConfig,
  bcryptConfig,
  cloudinaryConfig,
  corsConfig,
  databaseConfig,
  loggerConfig,
  mailConfig,
  swaggerConfig,
  envValidationSchema,
} from './config/index.js';

// Modules
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { CloudinaryModule } from './infrastructure/storage/cloudinary/cloudinary.module.js';
import { EmailModule } from './infrastructure/messaging/email/email.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/user.module.js';
import { CustomerModule } from './modules/customers/customer.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';

import { CatalogModule } from './modules/catalog/catalog.module.js';
import { SizeGuideModule } from './modules/size-guides/size-guide.module.js';

import { PurchaseModule } from './modules/purchases/purchase.module.js';
import { PurchaseReturnModule } from './modules/purchase-return/purchase-return.module.js';
import { SupplierModule } from './modules/suppliers/supplier.module.js';
import { OrderModule } from './modules/orders/order.module.js';
import { CartModule } from './modules/carts/cart.module.js';
import { BannerModule } from './modules/banners/banner.module.js';
import { DiscountModule } from './modules/discounts/discount.module.js';

import { ActivityLogModule } from './modules/activity-logs/activity-log.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { NotificationModule } from './modules/notifications/notification.module.js';
import { EmailModule as EmailLogsModule } from './modules/emails/email.module.js';
import { AuditModule } from './common/audit/audit.module.js';
import { AuditContextInterceptor } from './common/audit/audit-context.interceptor.js';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { StockModule } from './modules/inventory/stocks/stock.module.js';
import { PaymentModule } from './modules/payments/payment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationSchema: envValidationSchema,
      envFilePath: [
        '.env',
        '.env.local',
        '.env.development.local',
        '.env.test.local',
        '.env.production.local',
      ],
      load: [
        appConfig,
        authConfig,
        bcryptConfig,
        cloudinaryConfig,
        corsConfig,
        databaseConfig,
        loggerConfig,
        mailConfig,
        swaggerConfig,
      ],
    }),
    EmailModule,
    DatabaseModule,
    CloudinaryModule,

    DashboardModule,
    AnalyticsModule,
    StockModule,
    PaymentModule,

    AuthModule,
    UsersModule,
    PermissionsModule,

    CustomerModule,

    CatalogModule,
    SizeGuideModule,

    PurchaseModule,
    PurchaseReturnModule,
    SupplierModule,
    OrderModule,
    CartModule,

    BannerModule,
    DiscountModule,

    ActivityLogModule,
    SettingsModule,
    NotificationModule,
    EmailLogsModule,
    AuditModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
})
export class AppModule {}
