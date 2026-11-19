import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';
import { CreateCategoryDto } from '../dto/requests/create-category.dto.js';
import { CategoryResponseDto } from '../dto/responses/category-response.dto.js';

@Injectable()
export class CreateCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    createCategoryDto: CreateCategoryDto,
    userId: string,
  ): Promise<CategoryResponseDto> {
    const { name, slug, description, isActive } = createCategoryDto;

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

    const newCategory = await this.prisma.$transaction(async (tx) => {
      const created = await tx.category.create({
        data: {
          name,
          slug,
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.CATEGORY,
          action: 'CREATE_CATEGORY',
          description: 'Category created',
          entityType: 'CATEGORY',
          entityId: created.id,
          userId,
          newValue: {
            name: created.name,
            slug: created.slug,
            description: created.description,
            isActive: created.isActive,
          },
        },
        tx,
      );
      return created;
    });

    return {
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description ?? null,
      isActive: newCategory.isActive,
      createdAt: newCategory.createdAt,
      updatedAt: newCategory.updatedAt,
    };
  }
}
