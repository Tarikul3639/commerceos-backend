import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UpdateSecuritySettingsDto } from '../dto/requests/update-security-settings.dto';

@Injectable()
export class SecuritySettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Return the persisted security policy, creating recommended defaults on first access. */
  async get() {
    return this.prisma.securitySettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });
  }

  /** Persist policy changes after validating dependent lifetime settings. */
  async update(dto: UpdateSecuritySettingsDto) {
    if (
      dto.refreshTokenLifetimeDays !== undefined &&
      dto.rememberMeRefreshLifetimeDays !== undefined &&
      dto.rememberMeRefreshLifetimeDays < dto.refreshTokenLifetimeDays
    ) {
      throw new BadRequestException(
        'Remember-me session lifetime must be at least the standard session lifetime.',
      );
    }

    const current = await this.get();
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

    return this.prisma.securitySettings.update({
      where: { id: 'default' },
      data: dto,
    });
  }
}
