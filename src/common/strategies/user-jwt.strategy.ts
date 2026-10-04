import type { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { UserJwtPayload } from '@/common/interfaces/user-jwt-payload.interface';
import { USER_ACCESS_TOKEN_COOKIE } from '@/common/constants/cookie.constants';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          request.cookies?.[USER_ACCESS_TOKEN_COOKIE] ?? null,
      ]),

      secretOrKey: configService.getOrThrow<string>('auth.user.accessSecret'),
    });
  }

  async validate(payload: UserJwtPayload): Promise<UserJwtPayload> {
    return payload;
  }
}
