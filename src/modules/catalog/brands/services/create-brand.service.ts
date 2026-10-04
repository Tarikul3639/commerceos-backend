import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';

import { CreateBrandDto } from '../dto/requests/create-brand.dto';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

@Injectable()
export class CreateBrandService {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
    const { name, slug, description, image, publicId, isActive } =
      createBrandDto;

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

    const brand = await this.prisma.brand.create({
      data: {
        name: normalizedName,
        slug,
        ...(description !== undefined && {
          description: description.trim(),
        }),
        ...(image !== undefined && {
          image,
        }),
        ...(publicId !== undefined && {
          publicId,
        }),
        ...(isActive !== undefined && {
          isActive,
        }),
      },
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
