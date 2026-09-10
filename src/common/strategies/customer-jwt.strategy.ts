import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { CustomerJwtPayload } from '../interfaces/customer-jwt-payload.interface';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
    Strategy,
    'customer-jwt',
) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            secretOrKey: configService.getOrThrow<string>(
                'auth.customer.accessSecret',
            ),
        });
    }

    async validate(payload: CustomerJwtPayload) {
        return {
            id: payload.id,
            email: payload.email,
        };
    }
}
