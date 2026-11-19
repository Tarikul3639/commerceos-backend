import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../lib/prisma/client.js';

import { CreateBrandDto } from '../dto/requests/create-brand.dto.js';
import { BrandResponseDto } from '../dto/responses/brand-response.dto.js';

@Injectable()
export class CreateBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    createBrandDto: CreateBrandDto,
    userId: string,
  ): Promise<BrandResponseDto> {
    const { name, slug, description, image, publicId, isActive } =
      createBrandDto;

    if ((image !== undefined) !== (publicId !== undefined)) {
      throw new BadRequestException(
        'Brand image URL and Cloudinary public ID must be provided together',
      );
    }

    const normalizedName = name.trim();

    const existingBrand = await this.prisma.brand.findUnique({
      where: {
        name: normalizedName,
      },
      select: {
        id: true,
      },
    });

    if (existingBrand) {
      throw new ConflictException('Brand name already exists');
    }

    if (slug) {
      const existingSlug = await this.prisma.brand.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      if (existingSlug) {
        throw new ConflictException('Brand slug already exists');
      }
    }

    if (publicId !== undefined && publicId !== null) {
      const existingPublicId = await this.prisma.brand.findUnique({
        where: {
          publicId,
        },
        select: {
          id: true,
        },
      });

      if (existingPublicId) {
        throw new ConflictException('Brand public ID already exists');
      }
    }

    const brand = await this.prisma.$transaction(async (tx) => {
      const created = await tx.brand.create({
        data: {
          name: normalizedName,
          slug,
          ...(description !== undefined && {
            description: description.trim(),
          }),
          ...(image !== undefined && { image }),
          ...(publicId !== undefined && { publicId }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.BRAND,
          action: 'CREATE_BRAND',
          description: 'Brand created',
          entityType: 'BRAND',
          entityId: created.id,
          userId,
          newValue: {
            name: created.name,
            slug: created.slug,
            description: created.description,
            image: created.image,
            publicId: created.publicId,
            isActive: created.isActive,
          },
        },
        tx,
      );
      return created;
    });

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      image: brand.image,
      publicId: brand.publicId,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
  }
}
