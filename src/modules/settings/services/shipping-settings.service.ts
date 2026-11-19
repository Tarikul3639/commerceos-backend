import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateShippingZoneDto } from '../dto/requests/create-shipping-zone.dto';
import { UpdateShippingZoneDto } from '../dto/requests/update-shipping-zone.dto';
import { UpdateShippingSettingsDto } from '../dto/requests/update-shipping-settings.dto';

@Injectable()
export class ShippingSettingsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const existing = await this.prisma.shippingSettings.findUnique({
      where: { id: 'default' },
    });
    const threshold =
      dto.freeShippingThreshold === undefined
        ? (existing?.freeShippingThreshold ?? null)
        : dto.freeShippingThreshold;

    const settings = await this.prisma.shippingSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', freeShippingThreshold: threshold },
      update: { freeShippingThreshold: threshold },
    });

    return {
      freeShippingThreshold: settings.freeShippingThreshold?.toString() ?? null,
    };
  }

  async createZone(dto: CreateShippingZoneDto, userId: string) {
    const districtCity = this.normalizeName(dto.districtCity);
    const districtCityKey = this.normalizeKey(districtCity);

    const existing = await this.prisma.shippingZone.findUnique({
      where: { districtCityKey },
    });
    if (existing)
      throw new ConflictException(
        'A shipping zone already exists for this district/city',
      );

    const zone = await this.prisma.shippingZone.create({
      data: {
        districtCity,
        districtCityKey,
        rate: dto.rate,
        isActive: dto.isActive ?? true,
      },
    });
    return this.mapZone(zone);
  }

  async updateZone(id: string, dto: UpdateShippingZoneDto, userId: string) {
    const existing = await this.prisma.shippingZone.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Shipping zone not found');

    const districtCity =
      dto.districtCity === undefined
        ? existing.districtCity
        : this.normalizeName(dto.districtCity);
    const districtCityKey = this.normalizeKey(districtCity);
    if (districtCityKey !== existing.districtCityKey) {
      const duplicate = await this.prisma.shippingZone.findUnique({
        where: { districtCityKey },
      });
      if (duplicate)
        throw new ConflictException(
          'A shipping zone already exists for this district/city',
        );
    }

    const zone = await this.prisma.shippingZone.update({
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
    return this.mapZone(zone);
  }

  async deleteZone(id: string, userId: string) {
    const existing = await this.prisma.shippingZone.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Shipping zone not found');
    await this.prisma.shippingZone.delete({ where: { id } });
  }

  private normalizeName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizeKey(value: string) {
    return this.normalizeName(value).toLocaleLowerCase('en');
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
