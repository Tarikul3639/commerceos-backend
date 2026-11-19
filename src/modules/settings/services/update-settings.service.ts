import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../common/prisma/prisma.service.js';

import { UpdateSettingsDto } from '../dto/requests/update-settings.dto.js';
import { SettingsResponseDto } from '../dto/responses/settings-response.dto.js';

@Injectable()
export class UpdateSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    updateSettingsDto: UpdateSettingsDto,
    userId: string,
  ): Promise<SettingsResponseDto> {
    void userId;
    const existingSettings = await this.prisma.settings.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });

    let settings;

    if (!existingSettings) {
      settings = await this.prisma.settings.create({
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
    } else {
      settings = await this.prisma.settings.update({
        where: {
          id: existingSettings.id,
        },
        data: {
          ...updateSettingsDto,
        },
      });
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
