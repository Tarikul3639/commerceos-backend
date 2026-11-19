import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { CustomerJwtPayload } from '../interfaces/customer-jwt-payload.interface.js';
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from '../constants/cookie.constants.js';
import { PrismaService } from '../../infrastructure/database/prisma.service.js';
import { CustomerStatus } from '../../infrastructure/database/generated/prisma/enums.js';

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
          (request?.cookies?.[CUSTOMER_ACCESS_TOKEN_COOKIE] as
            string | undefined) ?? null,
      ]),
      secretOrKey: configService.getOrThrow<string>(
        'auth.customer.accessSecret',
      ),
    });
  }

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

    const validatedPayload: CustomerJwtPayload = {
      id: customer.id,
      email: customer.email,
    };
    return validatedPayload;
  }
}
