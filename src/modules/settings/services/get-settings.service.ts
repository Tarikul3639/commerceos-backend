import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { SettingsResponseDto } from '../dto/responses/settings-response.dto.js';

@Injectable()
export class GetSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<SettingsResponseDto | null> {
    const settings = await this.prisma.settings.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!settings) {
      return null;
    }

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
