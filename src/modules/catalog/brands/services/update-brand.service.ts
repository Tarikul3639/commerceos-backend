import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { UpdateBrandDto } from '../dto/requests/update-brand.dto';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

@Injectable()
export class UpdateBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(
    brandId: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandResponseDto> {
    const brand = await this.prisma.brand.findUnique({
      where: {
        id: brandId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        publicId: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!brand || brand.deletedAt) {
      throw new NotFoundException('Brand not found');
    }

    const normalizedName =
      updateBrandDto.name !== undefined
        ? updateBrandDto.name.trim()
        : undefined;

    const normalizedSlug =
      updateBrandDto.slug !== undefined
        ? updateBrandDto.slug.trim()
        : undefined;

    // Check duplicate name
    if (normalizedName !== undefined && normalizedName !== brand.name) {
      const existingBrand = await this.prisma.brand.findUnique({
        where: {
          name: normalizedName,
        },
        select: {
          id: true,
        },
      });

      if (existingBrand && existingBrand.id !== brandId) {
        throw new ConflictException('Brand name already exists');
      }
    }

    // Check duplicate slug
    if (normalizedSlug !== undefined && normalizedSlug !== brand.slug) {
      const existingSlug = await this.prisma.brand.findUnique({
        where: {
          slug: normalizedSlug,
        },
        select: {
          id: true,
        },
      });

      if (existingSlug && existingSlug.id !== brandId) {
        throw new ConflictException('Brand slug already exists');
      }
    }

    // Check duplicate publicId
    if (
      updateBrandDto.publicId !== undefined &&
      updateBrandDto.publicId !== null
    ) {
      const existingPublicId = await this.prisma.brand.findUnique({
        where: {
          publicId: updateBrandDto.publicId,
        },
        select: {
          id: true,
        },
      });

      if (existingPublicId && existingPublicId.id !== brandId) {
        throw new ConflictException('Brand public ID already exists');
      }
    }

    const updatedBrand = await this.prisma.brand.update({
      where: {
        id: brandId,
      },
      data: {
        ...(normalizedName !== undefined && {
          name: normalizedName,
        }),

        ...(normalizedSlug !== undefined && {
          slug: normalizedSlug,
        }),

        ...(updateBrandDto.description !== undefined && {
          description: updateBrandDto.description.trim(),
        }),

        ...(updateBrandDto.image !== undefined && {
          image: updateBrandDto.image,
        }),

        ...(updateBrandDto.publicId !== undefined && {
          publicId: updateBrandDto.publicId,
        }),

        ...(updateBrandDto.isActive !== undefined && {
          isActive: updateBrandDto.isActive,
        }),
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.BRAND,
      action: 'UPDATE_BRAND',
      description: `Brand "${updatedBrand.name}" was updated`,
      entityType: 'BRAND',
      entityId: updatedBrand.id,
      oldValue: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        image: brand.image,
        publicId: brand.publicId,
        isActive: brand.isActive,
      },
      newValue: {
        name: updatedBrand.name,
        slug: updatedBrand.slug,
        description: updatedBrand.description,
        image: updatedBrand.image,
        publicId: updatedBrand.publicId,
        isActive: updatedBrand.isActive,
      },
    });

    return {
      id: updatedBrand.id,
      name: updatedBrand.name,
      slug: updatedBrand.slug,
      description: updatedBrand.description,
      image: updatedBrand.image,
      publicId: updatedBrand.publicId,
      isActive: updatedBrand.isActive,
      createdAt: updatedBrand.createdAt,
      updatedAt: updatedBrand.updatedAt,
    };
  }
}
