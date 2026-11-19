// src/modules/auth/customer/services/logout.service.ts

import { Injectable } from '@nestjs/common';

import { CustomerRefreshTokenService } from './refresh-token.service';

@Injectable()
export class CustomerLogoutService {
  constructor(
    private readonly refreshTokenService: CustomerRefreshTokenService,
  ) {}

  async execute(customerId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenService.consume(customerId, refreshToken);
  }
}
