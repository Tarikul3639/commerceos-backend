import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class LogoutService {
    constructor(private readonly refreshTokenService: RefreshTokenService) { }

    async execute(userId: string, refreshToken: string): Promise<void> {
        // Validate the refresh token and ensure it belongs to the user
        const token = await this.refreshTokenService.validate(userId, refreshToken);
        // Revoke the specific refresh token
        await this.refreshTokenService.revoke(token.id);
    }
}
