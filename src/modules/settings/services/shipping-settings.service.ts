import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/enums.js';
import { CreateShippingZoneDto } from '../dto/requests/create-shipping-zone.dto.js';
import { UpdateShippingZoneDto } from '../dto/requests/update-shipping-zone.dto.js';
import { UpdateShippingSettingsDto } from '../dto/requests/update-shipping-settings.dto.js';

@Injectable()
export class ShippingSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLog: CreateActivityLogService,
  ) {}

  async getSettings() {
    const [settings, zones] = await Promise.all([
      this.prisma.shippingSettings.findUnique({ where: { id: 'default' } }),
      this.prisma.shippingZone.findMany({ orderBy: [{ districtCity: 'asc' }] }),
    ]);

    return {
      freeShippingThreshold:
        settings?.freeShippingThreshold?.toString() ?? null,
      zones: zones.map((zone) => this.mapZone(zone)),
    };
  }

  async updateSettings(dto: UpdateShippingSettingsDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.shippingSettings.findUnique({
        where: { id: 'default' },
      });
      const threshold =
        dto.freeShippingThreshold === undefined
          ? (existing?.freeShippingThreshold ?? null)
          : dto.freeShippingThreshold;
      const saved = await tx.shippingSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', freeShippingThreshold: threshold },
        update: { freeShippingThreshold: threshold },
      });

      await this.activityLog.execute(
        {
          type: existing ? ActivityType.UPDATE : ActivityType.CREATE,
          module: ActivityModule.SETTINGS,
          action: 'UPDATE_SHIPPING_SETTINGS',
          description: 'Shipping settings changed',
          entityType: 'ShippingSettings',
          entityId: saved.id,
          userId,
          ...(existing
            ? {
                oldValue: {
                  freeShippingThreshold:
                    existing.freeShippingThreshold?.toString() ?? null,
                },
              }
            : {}),
          newValue: {
            freeShippingThreshold:
              saved.freeShippingThreshold?.toString() ?? null,
          },
        },
        tx,
      );

      return {
        freeShippingThreshold: saved.freeShippingThreshold?.toString() ?? null,
      };
    });
  }

  async createZone(dto: CreateShippingZoneDto, userId: string) {
    const districtCity = this.normalizeName(dto.districtCity);
    const districtCityKey = this.normalizeKey(districtCity);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.shippingZone.findUnique({
        where: { districtCityKey },
      });
      if (existing) {
        throw new ConflictException(
          'A shipping zone already exists for this district/city',
        );
      }

      const zone = await tx.shippingZone.create({
        data: {
          districtCity,
          districtCityKey,
          rate: dto.rate,
          isActive: dto.isActive ?? true,
        },
      });
      await this.activityLog.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.SETTINGS,
          action: 'CREATE_SHIPPING_ZONE',
          description: `Shipping zone ${zone.districtCity} created`,
          entityType: 'ShippingZone',
          entityId: zone.id,
          userId,
          newValue: this.auditZone(zone),
        },
        tx,
      );
      return this.mapZone(zone);
    });
  }

  async updateZone(id: string, dto: UpdateShippingZoneDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.shippingZone.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Shipping zone not found');

      const districtCity =
        dto.districtCity === undefined
          ? existing.districtCity
          : this.normalizeName(dto.districtCity);
      const districtCityKey = this.normalizeKey(districtCity);
      if (districtCityKey !== existing.districtCityKey) {
        const duplicate = await tx.shippingZone.findUnique({
          where: { districtCityKey },
        });
        if (duplicate) {
          throw new ConflictException(
            'A shipping zone already exists for this district/city',
          );
        }
      }

      const zone = await tx.shippingZone.update({
        where: { id },
        data: {
          ...(dto.districtCity !== undefined && {
            districtCity,
            districtCityKey,
          }),
          ...(dto.rate !== undefined && { rate: dto.rate }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
      await this.activityLog.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.SETTINGS,
          action: 'UPDATE_SHIPPING_ZONE',
          description: `Shipping zone ${zone.districtCity} updated`,
          entityType: 'ShippingZone',
          entityId: zone.id,
          userId,
          oldValue: this.auditZone(existing),
          newValue: this.auditZone(zone),
        },
        tx,
      );
      return this.mapZone(zone);
    });
  }

  async deleteZone(id: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.shippingZone.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Shipping zone not found');

      await tx.shippingZone.delete({ where: { id } });
      await this.activityLog.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.SETTINGS,
          action: 'DELETE_SHIPPING_ZONE',
          description: `Shipping zone ${existing.districtCity} deleted`,
          entityType: 'ShippingZone',
          entityId: existing.id,
          userId,
          oldValue: this.auditZone(existing),
        },
        tx,
      );
    });
  }

  private normalizeName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizeKey(value: string) {
    return this.normalizeName(value).toLocaleLowerCase('en');
  }

  private auditZone(zone: {
    id: string;
    districtCity: string;
    rate: { toString(): string };
    isActive: boolean;
  }) {
    return {
      districtCity: zone.districtCity,
      rate: zone.rate.toString(),
      isActive: zone.isActive,
    };
  }

  private mapZone(zone: {
    id: string;
    districtCity: string;
    rate: { toString(): string };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: zone.id,
      districtCity: zone.districtCity,
      rate: zone.rate.toString(),
      isActive: zone.isActive,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
    };
  }
}
