import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CreateBrandDto } from '../dto/requests/create-brand.dto';
import { BrandResponseDto } from '../dto/responses/brand-response.dto';

import { generateSlug } from '../../../../common/utils/slug.util';

@Injectable()
export class CreateBrandService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(createBrandDto: CreateBrandDto): Promise<BrandResponseDto> {
        const { name, description, image, isActive } = createBrandDto;

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

        const slug = generateSlug(normalizedName);

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
            isActive: brand.isActive,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
        };
    }
}
