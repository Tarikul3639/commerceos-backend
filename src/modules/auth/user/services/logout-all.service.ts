import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class LogoutAllService {
    constructor(private readonly refreshTokenService: RefreshTokenService) { }

    async execute(userId: string): Promise<void> {
        // Revoke all active sessions for the user
        await this.refreshTokenService.revokeAll(userId);
    }
}