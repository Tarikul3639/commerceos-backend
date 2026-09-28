import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateBrandDto } from '../dto/requests/update-brand.dto';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

@Injectable()
export class UpdateBrandService {
    constructor(private readonly prisma: PrismaService) { }

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
