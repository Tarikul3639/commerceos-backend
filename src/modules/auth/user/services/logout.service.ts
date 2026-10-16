import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly createActivityLog: CreateActivityLogService,
  ) {}

  async execute(userId: string, refreshToken: string): Promise<void> {
    // Validate the refresh token and ensure it belongs to the user
    const token = await this.refreshTokenService.validate(userId, refreshToken);
    // Revoke the specific refresh token
    await this.refreshTokenService.revoke(token.id);
    await this.createActivityLog.execute({
      type: ActivityType.LOGOUT,
      module: ActivityModule.AUTH,
      action: 'LOGOUT',
      description: `User ${userId} logged out`,
      entityType: 'User',
      entityId: userId,
      userId,
    });
  }
}
