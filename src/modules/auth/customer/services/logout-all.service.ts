// src/modules/auth/customer/services/logout-all.service.ts

import { Injectable } from '@nestjs/common';
import { CustomerRefreshTokenService } from './refresh-token.service';

@Injectable()
export class CustomerLogoutAllService {
    constructor(
        private readonly refreshTokenService: CustomerRefreshTokenService,
    ) {}

    async execute(customerId: string): Promise<void> {
        await this.refreshTokenService.revokeAll(
            customerId,
        );
    }
}