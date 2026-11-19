import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../infrastructure/database/generated/prisma/enums.js';

import { UpdateSettingsDto } from '../dto/requests/update-settings.dto.js';
import { SettingsResponseDto } from '../dto/responses/settings-response.dto.js';

@Injectable()
export class UpdateSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: CreateActivityLogService,
  ) {}

  async execute(
    updateSettingsDto: UpdateSettingsDto,
    userId: string,
  ): Promise<SettingsResponseDto> {
    const settings = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.settings.findFirst({
        orderBy: { createdAt: 'asc' },
      });

      const saved = existing
        ? await tx.settings.update({
            where: { id: existing.id },
            data: updateSettingsDto,
          })
        : await tx.settings.create({
            data: {
              companyName: updateSettingsDto.companyName ?? 'CommerceOS',
              companyEmail: updateSettingsDto.companyEmail ?? '',
              companyPhone: updateSettingsDto.companyPhone ?? '',
              companyAddress: updateSettingsDto.companyAddress ?? '',
              logo: updateSettingsDto.logo ?? null,
              favicon: updateSettingsDto.favicon ?? null,
              currency: updateSettingsDto.currency ?? 'BDT',
              timezone: updateSettingsDto.timezone ?? 'Asia/Dhaka',
            },
          });

      await this.activityLog.execute(
        {
          type: existing ? ActivityType.UPDATE : ActivityType.CREATE,
          module: ActivityModule.SETTINGS,
          action: existing
            ? 'UPDATE_GENERAL_SETTINGS'
            : 'CREATE_GENERAL_SETTINGS',
          description: 'General store settings changed',
          entityType: 'Settings',
          entityId: saved.id,
          userId,
          ...(existing
            ? { oldValue: existing, newValue: saved }
            : { newValue: saved }),
        },
        tx,
      );

      return saved;
    });

    return {
      id: settings.id,
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      logo: settings.logo,
      favicon: settings.favicon,
      currency: settings.currency,
      timezone: settings.timezone,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
