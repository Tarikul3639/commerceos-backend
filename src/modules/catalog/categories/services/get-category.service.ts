import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CategoryResponseDto } from '../dto/responses/category-response.dto';

@Injectable()
export class GetCategoryService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async execute(
        categoryId: string,
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

        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            publicId: category.publicId,
            isActive: category.isActive,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}