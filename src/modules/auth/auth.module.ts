import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { MailModule } from '../../common/mail';
import type { StringValue } from 'ms';

import { TokenService } from './common/services/token.service';

// User Auth Controller
import { UserAuthController } from './user/controllers/user-auth.controller';

// User Auth Services
import { LoginService } from './user/services/login.service';
import { LogoutService } from './user/services/logout.service';
import { LogoutAllService } from './user/services/logout-all.service';
import { RefreshTokenService } from './user/services/refresh-token.service';

@Module({
    imports: [
        MailModule,
        PrismaModule,
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
    controllers: [UserAuthController],
    providers: [
        TokenService,
        RefreshTokenService,
        
        LoginService,
        LogoutService,
        LogoutAllService,
    ],
    exports: [JwtModule],
})
export class AuthModule { }
