import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/requests/create-category.dto';
import { CategoryResponseDto } from '../dto/responses/category-response.dto';

@Injectable()
export class CreateCategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const { name, slug, description, image, publicId, isActive } =
            createCategoryDto;

        const existingCategory = await this.prisma.category.findFirst({
            where: {
                OR: [{ name }, { slug }],
            },

            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        if (existingCategory) {
            if (existingCategory.name === name) {
                throw new ConflictException('Category name already exists');
            }
            if (existingCategory.slug === slug) {
                throw new ConflictException('Category slug already exists');
            }
        }

        const newCategory = await this.prisma.category.create({
            data: {
                name,
                slug,
                ...(description !== undefined && { description }),
                ...(image !== undefined && { image }),
                ...(publicId !== undefined && { publicId }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return {
            id: newCategory.id,
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description ?? null,
            image: newCategory.image ?? null,
            publicId: newCategory.publicId ?? null,
            isActive: newCategory.isActive,
            createdAt: newCategory.createdAt,
            updatedAt: newCategory.updatedAt,
        };
    }
}
