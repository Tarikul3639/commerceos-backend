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
} from '@/config';

// Modules
import { PrismaModule } from '@/common/prisma/prisma.module';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';
import { MailModule } from '@/common/mail/mail.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/user.module';
import { CustomerModule } from '@/modules/customers/customer.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';

import { CatalogModule } from '@/modules/catalog/catalog.module';
import { SizeGuideModule } from '@/modules/size-guides/size-guide.module';

import { PurchaseModule } from '@/modules/purchases/purchase.module';
import { PurchaseReturnModule } from '@/modules/purchase-return/purchase-return.module';
import { SupplierModule } from '@/modules/suppliers/supplier.module';
import { OrderModule } from '@/modules/orders/order.module';
import { CartModule } from '@/modules/carts/cart.module';
import { BannerModule } from '@/modules/banners/banner.module';

import { ActivityLogModule } from '@/modules/activity-logs/activity-log.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { NotificationModule } from '@/modules/notifications/notification.module';
import { AuditModule } from '@/common/audit/audit.module';
import { AuditContextInterceptor } from '@/common/audit/audit-context.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { StockModule } from '@/modules/inventory/stocks/stock.module';
import { PaymentModule } from '@/modules/payments/payment.module';
import { PaymentGatewayConfigModule } from "./modules/payment-gateway-config/payment-gateway-config.module"

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
    MailModule,
    PrismaModule,
    CloudinaryModule,

    DashboardModule,
    AnalyticsModule,
    StockModule,
    PaymentModule,
    PaymentGatewayConfigModule,

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

    ActivityLogModule,
    SettingsModule,
    NotificationModule,
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
export class AppModule { }
