import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';

import { CategoryQueryDto } from '../dto/requests/category-query.dto';
import { CategoryResponseDto } from '../dto/responses/category-response.dto';

import { PaginatedResponse } from '../../../../common/interfaces/paginated-response.interface';

@Injectable()
export class GetCategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        query: CategoryQueryDto,
    ): Promise<PaginatedResponse<CategoryResponseDto>> {
        const { search, isActive, page = 1, limit = 10 } = query;

        const skip = (page - 1) * limit;

        const where = {
            deletedAt: null,

            ...(search && {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },

                    {
                        slug: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                ],
            }),

            ...(isActive !== undefined && {
                isActive,
            }),
        };

        const [categories, total] = await this.prisma.$transaction([
            this.prisma.category.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: 'desc',
                },
            }),

            this.prisma.category.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const data = categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            publicId: category.publicId,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        }));

        return {
            data,

            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
}
