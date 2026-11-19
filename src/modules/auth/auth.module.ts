// Framework
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { StringValue } from 'ms';

// Common Modules
import { DatabaseModule } from '../../infrastructure/database/database.module.js';
import { EmailModule } from '../../infrastructure/messaging/email/email.module.js';

// Customer Authentication
import { CustomerJwtStrategy } from '../../common/strategies/customer-jwt.strategy.js';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard.js';

// User Authentication
import { UserJwtStrategy } from '../../common/strategies/user-jwt.strategy.js';
import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard.js';

// Controllers
import { UserAuthController } from './user/controllers/user-auth.controller.js';
import { CustomerAuthController } from './customer/controllers/customer-auth.controller.js';

// User Auth Services
import { TokenService } from './user/services/token.service.js';
import { LoginService } from './user/services/login.service.js';
import { LogoutService } from './user/services/logout.service.js';
import { LogoutAllService } from './user/services/logout-all.service.js';
import { RefreshTokenService } from './user/services/refresh-token.service.js';

import { GetCurrentUserService } from './user/services/get-current-user.service.js';
import { ChangePasswordService } from './user/services/change-password.service.js';
import { ForgotPasswordService } from './user/services/forgot-password.service.js';
import { ResetPasswordService } from './user/services/reset-password.service.js';
import { VerifyEmailService } from './user/services/verify-email.service.js';

// Customer Auth Services
import { CustomerRegisterService } from './customer/services/register.service.js';
import { CustomerTokenService } from './customer/services/token.service.js';
import { CustomerLoginService } from './customer/services/login.service.js';
import { CustomerLogoutService } from './customer/services/logout.service.js';
import { CustomerLogoutAllService } from './customer/services/logout-all.service.js';
import { CustomerRefreshTokenService } from './customer/services/refresh-token.service.js';

import { CustomerChangePasswordService } from './customer/services/change-password.service.js';
import { CustomerForgotPasswordService } from './customer/services/forgot-password.service.js';
import { CustomerResetPasswordService } from './customer/services/reset-password.service.js';
import { CustomerVerifyEmailService } from './customer/services/verify-email.service.js';

@Module({
  imports: [
    EmailModule,
    DatabaseModule,
    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('auth.user.accessSecret'),

        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>(
            'auth.user.accessExpiresIn',
          ),
        },
      }),
    }),
  ],

  controllers: [UserAuthController, CustomerAuthController],

  providers: [
    // Customer Authentication
    CustomerJwtStrategy,
    CustomerJwtAuthGuard,

    // User Authentication
    UserJwtStrategy,
    UserJwtAuthGuard,

    // User Auth Services
    TokenService,
    RefreshTokenService,

    GetCurrentUserService,
    LoginService,
    LogoutService,
    LogoutAllService,

    ChangePasswordService,
    ForgotPasswordService,
    ResetPasswordService,
    VerifyEmailService,

    // Customer Auth Services
    CustomerRegisterService,
    CustomerTokenService,
    CustomerLoginService,
    CustomerLogoutService,
    CustomerLogoutAllService,
    CustomerRefreshTokenService,

    CustomerChangePasswordService,
    CustomerForgotPasswordService,
    CustomerResetPasswordService,
    CustomerVerifyEmailService,
  ],

  exports: [JwtModule, TokenService, VerifyEmailService, GetCurrentUserService],
})
export class AuthModule {}
