import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateBrandDto } from '../dto/requests/update-brand.dto';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

import { generateSlug } from '../../../../common/utils/slug.util';

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

        let slug: string | undefined;

        if (
            updateBrandDto.name !== undefined &&
            updateBrandDto.name.trim() !== brand.name
        ) {
            const normalizedName = updateBrandDto.name.trim();

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

            slug = generateSlug(normalizedName);

            const existingSlug = await this.prisma.brand.findUnique({
                where: {
                    slug,
                },

                select: {
                    id: true,
                },
            });

            if (existingSlug && existingSlug.id !== brandId) {
                throw new ConflictException('Brand slug already exists');
            }
        }

        const updatedBrand = await this.prisma.brand.update({
            where: {
                id: brandId,
            },

            data: {
                ...(updateBrandDto.name !== undefined && {
                    name: updateBrandDto.name.trim(),
                }),

                ...(slug !== undefined && {
                    slug,
                }),

                ...(updateBrandDto.description !== undefined && {
                    description: updateBrandDto.description?.trim(),
                }),

                ...(updateBrandDto.image !== undefined && {
                    image: updateBrandDto.image,
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
            isActive: updatedBrand.isActive,
            createdAt: updatedBrand.createdAt,
            updatedAt: updatedBrand.updatedAt,
        };
    }
}
