// Framework
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { StringValue } from 'ms';

// Common Modules
import { PrismaModule } from '../../common/prisma/prisma.module';
import { MailModule } from '../../common/mail/mail.module';

// Customer Authentication
import { CustomerJwtStrategy } from '../../common/strategies/customer-jwt.strategy';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';

// User Authentication
import { UserJwtStrategy } from '../../common/strategies/user-jwt.strategy';
import { UserJwtAuthGuard } from '../../common/guards/user-jwt-auth.guard';

// Controllers
import { UserAuthController } from './user/controllers/user-auth.controller';
import { CustomerAuthController } from './customer/controllers/customer-auth.controller';

// User Auth Services
import { TokenService } from './user/services/token.service';
import { LoginService } from './user/services/login.service';
import { LogoutService } from './user/services/logout.service';
import { LogoutAllService } from './user/services/logout-all.service';
import { RefreshTokenService } from './user/services/refresh-token.service';

import { GetCurrentUserService } from './user/services/get-current-user.service';
import { ChangePasswordService } from './user/services/change-password.service';
import { ForgotPasswordService } from './user/services/forgot-password.service';
import { ResetPasswordService } from './user/services/reset-password.service';
import { VerifyEmailService } from './user/services/verify-email.service';

// Customer Auth Services
import { CustomerRegisterService } from './customer/services/register.service';
import { CustomerTokenService } from './customer/services/token.service';
import { CustomerLoginService } from './customer/services/login.service';
import { CustomerLogoutService } from './customer/services/logout.service';
import { CustomerLogoutAllService } from './customer/services/logout-all.service';
import { CustomerRefreshTokenService } from './customer/services/refresh-token.service';

import { CustomerChangePasswordService } from './customer/services/change-password.service';
import { CustomerForgotPasswordService } from './customer/services/forgot-password.service';
import { CustomerResetPasswordService } from './customer/services/reset-password.service';
import { CustomerVerifyEmailService } from './customer/services/verify-email.service';

@Module({
    imports: [
        MailModule,
        PrismaModule,
        PassportModule,

        JwtModule.registerAsync({
            inject: [ConfigService],

            useFactory: (
                configService: ConfigService,
            ) => ({
                secret: configService.getOrThrow<string>(
                    'auth.user.accessSecret',
                ),

                signOptions: {
                    expiresIn:
                        configService.getOrThrow<StringValue>(
                            'auth.user.accessExpiresIn',
                        ),
                },
            }),
        }),
    ],

    controllers: [
        UserAuthController,
        CustomerAuthController,
    ],

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

    exports: [
        JwtModule,
        VerifyEmailService,
        GetCurrentUserService,
    ],
})
export class AuthModule { }