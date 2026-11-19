import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { UserJwtPayload } from '@/common/interfaces/user-jwt-payload.interface';
import { USER_ACCESS_TOKEN_COOKIE } from '@/common/constants/cookie.constants';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserStatus } from '@/lib/prisma/enums';

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          request.cookies?.[USER_ACCESS_TOKEN_COOKIE] ?? null,
      ]),
      secretOrKey: configService.getOrThrow<string>('auth.user.accessSecret'),
    });
  }

  /**
   * Resolve the current staff account and reject tokens for disabled or deleted users.
   */
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

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ...(payload.remember !== undefined ? { remember: payload.remember } : {}),
    };
  }
}
