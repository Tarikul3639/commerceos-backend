import type { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { CustomerJwtPayload } from '../interfaces/customer-jwt-payload.interface';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '../constants/cookie.constants';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
    Strategy,
    'customer-jwt',
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.[CUSTOMER_ACCESS_TOKEN_COOKIE] ?? null;
                },
            ]),

            secretOrKey: configService.getOrThrow<string>(
                'auth.customer.accessSecret',
            ),
        });
    }

    async validate(payload: CustomerJwtPayload) {
        return payload;
    }
}
