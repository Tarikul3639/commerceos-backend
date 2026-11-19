import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { CustomerJwtPayload } from '@/common/interfaces/customer-jwt-payload.interface';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '@/common/constants/cookie.constants';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CustomerStatus } from '@/lib/prisma/enums';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          request?.cookies?.[CUSTOMER_ACCESS_TOKEN_COOKIE] ?? null,
      ]),
      secretOrKey: configService.getOrThrow<string>(
        'auth.customer.accessSecret',
      ),
    });
  }

  /**
   * Resolve the current customer account and reject disabled or deleted accounts.
   */
  async validate(payload: CustomerJwtPayload): Promise<CustomerJwtPayload> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        status: true,
        deletedAt: true,
      },
    });

    if (
      !customer ||
      customer.status !== CustomerStatus.ACTIVE ||
      customer.deletedAt
    ) {
      throw new UnauthorizedException('Customer account is not active.');
    }

    return {
      id: customer.id,
      email: customer.email,
    };
  }
}
