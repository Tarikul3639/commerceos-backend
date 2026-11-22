import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { UpdateAnnouncementSettingsDto } from '../dto/requests/update-announcement-settings.dto.js';

const DEFAULT_ANNOUNCEMENT = 'Free delivery on orders over $50';

@Injectable()
export class AnnouncementSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.announcementSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', message: DEFAULT_ANNOUNCEMENT },
      update: {},
    });
  }

  async getStorefront() {
    const settings = await this.prisma.announcementSettings.findUnique({
      where: { id: 'default' },
      select: { message: true, isActive: true },
    });

    if (!settings) {
      return { message: DEFAULT_ANNOUNCEMENT };
    }

    if (!settings.isActive || !settings.message.trim()) {
      return null;
    }

    return { message: settings.message };
  }

  async update(dto: UpdateAnnouncementSettingsDto) {
    return this.prisma.announcementSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        message: dto.message.trim(),
        isActive: dto.isActive ?? true,
      },
      update: {
        message: dto.message.trim(),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }
}
