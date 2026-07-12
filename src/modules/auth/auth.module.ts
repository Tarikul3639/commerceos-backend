import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { MailModule } from '../../common/mail';
import type { StringValue } from 'ms';

@Module({
    imports: [
        MailModule,
        PrismaModule,
        JwtModule.registerAsync({
            inject: [ConfigService],

            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('auth.accessSecret'),

                signOptions: {
                    expiresIn: configService.getOrThrow<StringValue>(
                        'auth.accessExpiresIn',
                    ),
                },
            }),
        }),
    ],
    controllers: [],
    providers: [],
    exports: [JwtModule],
})
export class AuthModule { }
