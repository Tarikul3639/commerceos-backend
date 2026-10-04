// Framework
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { StringValue } from 'ms';

// Common Modules
import { PrismaModule } from '@/common/prisma/prisma.module';
import { MailModule } from '@/common/mail/mail.module';

// Customer Authentication
import { CustomerJwtStrategy } from '@/common/strategies/customer-jwt.strategy';
import { CustomerJwtAuthGuard } from '@/common/guards/customer-jwt-auth.guard';

// User Authentication
import { UserJwtStrategy } from '@/common/strategies/user-jwt.strategy';
import { UserJwtAuthGuard } from '@/common/guards/user-jwt-auth.guard';

// Controllers
import { UserAuthController } from '@/modules/auth/user/controllers/user-auth.controller';
import { CustomerAuthController } from '@/modules/auth/customer/controllers/customer-auth.controller';

// User Auth Services
import { TokenService } from '@/modules/auth/user/services/token.service';
import { LoginService } from '@/modules/auth/user/services/login.service';
import { LogoutService } from '@/modules/auth/user/services/logout.service';
import { LogoutAllService } from '@/modules/auth/user/services/logout-all.service';
import { RefreshTokenService } from '@/modules/auth/user/services/refresh-token.service';

import { GetCurrentUserService } from '@/modules/auth/user/services/get-current-user.service';
import { ChangePasswordService } from '@/modules/auth/user/services/change-password.service';
import { ForgotPasswordService } from '@/modules/auth/user/services/forgot-password.service';
import { ResetPasswordService } from '@/modules/auth/user/services/reset-password.service';
import { VerifyEmailService } from '@/modules/auth/user/services/verify-email.service';

// Customer Auth Services
import { CustomerRegisterService } from '@/modules/auth/customer/services/register.service';
import { CustomerTokenService } from '@/modules/auth/customer/services/token.service';
import { CustomerLoginService } from '@/modules/auth/customer/services/login.service';
import { CustomerLogoutService } from '@/modules/auth/customer/services/logout.service';
import { CustomerLogoutAllService } from '@/modules/auth/customer/services/logout-all.service';
import { CustomerRefreshTokenService } from '@/modules/auth/customer/services/refresh-token.service';

import { CustomerChangePasswordService } from '@/modules/auth/customer/services/change-password.service';
import { CustomerForgotPasswordService } from '@/modules/auth/customer/services/forgot-password.service';
import { CustomerResetPasswordService } from '@/modules/auth/customer/services/reset-password.service';
import { CustomerVerifyEmailService } from '@/modules/auth/customer/services/verify-email.service';

@Module({
  imports: [
    MailModule,
    PrismaModule,
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

  exports: [JwtModule, VerifyEmailService, GetCurrentUserService],
})
export class AuthModule {}
