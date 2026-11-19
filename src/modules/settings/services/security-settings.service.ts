import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/enums.js';
import { UpdateSecuritySettingsDto } from '../dto/requests/update-security-settings.dto.js';

@Injectable()
export class SecuritySettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: CreateActivityLogService,
  ) {}

  /** Return the persisted security policy, creating recommended defaults on first access. */
  async get() {
    return this.prisma.securitySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });
  }

  /** Persist policy changes and their audit record atomically. */
  async update(dto: UpdateSecuritySettingsDto, userId: string) {
    if (
      dto.refreshTokenLifetimeDays !== undefined &&
      dto.rememberMeRefreshLifetimeDays !== undefined &&
      dto.rememberMeRefreshLifetimeDays < dto.refreshTokenLifetimeDays
    ) {
      throw new BadRequestException(
        'Remember-me session lifetime must be at least the standard session lifetime.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.securitySettings.upsert({
        where: { id: 'default' },
        create: { id: 'default' },
        update: {},
      });
      const standardLifetime =
        dto.refreshTokenLifetimeDays ?? current.refreshTokenLifetimeDays;
      const rememberLifetime =
        dto.rememberMeRefreshLifetimeDays ??
        current.rememberMeRefreshLifetimeDays;

      if (rememberLifetime < standardLifetime) {
        throw new BadRequestException(
          'Remember-me session lifetime must be at least the standard session lifetime.',
        );
      }

      const saved = await tx.securitySettings.update({
        where: { id: 'default' },
        data: dto,
      });

      await this.activityLog.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.SETTINGS,
          action: 'UPDATE_SECURITY_SETTINGS',
          description: 'Security policy settings changed',
          entityType: 'SecuritySettings',
          entityId: saved.id,
          userId,
          oldValue: current,
          newValue: saved,
        },
        tx,
      );

      return saved;
    });
  }
}
