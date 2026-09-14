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
} from './config';

// Modules
import { PrismaModule } from './common/prisma/prisma.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { MailModule } from './common/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import { RoleModule } from './modules/roles/role.module';
import { CustomerModule } from './modules/customers/customer.module';

import { CategoryModule } from './modules/catalog/categories/category.module';
import { BrandModule } from './modules/catalog/brands/brand.module';
import { AttributeModule } from './modules/catalog/attributes/attribute.module';
import { ProductModule } from './modules/catalog/products/product.module';
import { DiscountModule } from './modules/catalog/discounts/discount.module';

import { WarehouseModule } from './modules/inventory/warehouses/warehouse.module';
import { StockModule } from './modules/inventory/stocks/stock.module';
import { StockMovementModule } from './modules/inventory/stock-movements/stock-movement.module';
import { StockTransferModule } from './modules/inventory/stock-transfers/stock-transfer.module';

import { PurchaseModule } from './modules/purchases/purchase.module';
import { SupplierModule } from './modules/suppliers/supplier.module';
import { OrderModule } from './modules/orders/order.module';
import { CartModule } from './modules/carts/cart.module';
import { BannerModule } from './modules/banners/banner.module';

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
    
    AuthModule,
    UsersModule,
    RoleModule,

    CustomerModule,

    CategoryModule,
    BrandModule,
    AttributeModule,
    ProductModule,
    DiscountModule,

    WarehouseModule,
    StockModule,
    StockMovementModule,
    StockTransferModule,

    PurchaseModule,
    SupplierModule,
    OrderModule,
    CartModule,

    BannerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }