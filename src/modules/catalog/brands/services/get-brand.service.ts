import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { BrandResponseDto } from '../dto/responses/brand-response.dto';

@Injectable()
export class GetBrandService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(brandId: string): Promise<BrandResponseDto> {
        const brand = await this.prisma.brand.findFirst({
            where: {
                id: brandId,
                deletedAt: null,
            },

            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!brand) {
            throw new NotFoundException('Brand not found');
        }

        return brand;
    }
}
