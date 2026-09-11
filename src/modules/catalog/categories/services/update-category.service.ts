import {
    ConflictException,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { UpdateCategoryDto } from '../dto/requests/update-category.dto';
import { CategoryResponseDto } from '../dto/responses/category-response.dto';

@Injectable()
export class UpdateCategoryService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        categoryId: string,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const category =
            await this.prisma.category.findFirst({
                where: {
                    id: categoryId,
                    deletedAt: null,
                },
            });

        if (!category) {
            throw new NotFoundException(
                'Category not found',
            );
        }

        const {
            name,
            slug,
            description,
            image,
            publicId,
            isActive,
        } = updateCategoryDto;

        // Image URL and Cloudinary public ID must be updated together
        if (
            (image !== undefined && publicId === undefined) ||
            (image === undefined && publicId !== undefined)
        ) {
            throw new BadRequestException(
                'Image and publicId must be provided together',
            );
        }

        if (name !== undefined && name !== category.name) {
            const existingCategory =
                await this.prisma.category.findUnique({
                    where: {
                        name,
                    },

                    select: {
                        id: true,
                    },
                });

            if (existingCategory) {
                throw new ConflictException(
                    'Category name already exists',
                );
            }
        }

        if (slug !== undefined && slug !== category.slug) {
            const existingCategory =
                await this.prisma.category.findUnique({
                    where: {
                        slug,
                    },

                    select: {
                        id: true,
                    },
                });

            if (existingCategory) {
                throw new ConflictException(
                    'Category slug already exists',
                );
            }
        }

        const updatedCategory =
            await this.prisma.category.update({
                where: {
                    id: categoryId,
                },

                data: {
                    ...(name !== undefined && {
                        name,
                    }),

                    ...(slug !== undefined && {
                        slug,
                    }),

                    ...(description !== undefined && {
                        description,
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
            id: updatedCategory.id,
            name: updatedCategory.name,
            slug: updatedCategory.slug,
            description: updatedCategory.description,
            image: updatedCategory.image,
            publicId: updatedCategory.publicId,
            isActive: updatedCategory.isActive,
            createdAt: updatedCategory.createdAt,
            updatedAt: updatedCategory.updatedAt,
        };
    }
}