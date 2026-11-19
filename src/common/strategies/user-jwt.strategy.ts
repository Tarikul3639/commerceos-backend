import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { UserJwtPayload } from '../interfaces/user-jwt-payload.interface.js';
import { USER_ACCESS_TOKEN_COOKIE } from '../constants/cookie.constants.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { UserStatus } from '../../infrastructure/database/generated/prisma/enums.js';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          (request.cookies?.[USER_ACCESS_TOKEN_COOKIE] as string | undefined) ??
          null,
      ]),
      secretOrKey: configService.getOrThrow<string>('auth.user.accessSecret'),
    });
  }

  async validate(payload: UserJwtPayload): Promise<UserJwtPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        isVerified: true,
        deletedAt: true,
      },
    });

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.deletedAt ||
      !user.isVerified
    ) {
      throw new UnauthorizedException('User account is not active.');
    }

    const validatedPayload: UserJwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ...(payload.remember !== undefined ? { remember: payload.remember } : {}),
    };
    return validatedPayload;
  }
}
