import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly createActivityLog: CreateActivityLogService,
  ) {}

  async execute(userId: string, refreshToken: string): Promise<void> {
    // Validate the refresh token and ensure it belongs to the user
    await this.refreshTokenService.consume(userId, refreshToken);
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
