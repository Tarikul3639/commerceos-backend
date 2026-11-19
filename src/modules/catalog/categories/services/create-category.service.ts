import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../lib/prisma/client.js';
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

    const newCategory = await this.prisma.category.create({
      data: {
        name,
        slug,
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.CATEGORY,
      action: 'CREATE_CATEGORY',
      description: `Category "${newCategory.name}" was created`,
      entityType: 'CATEGORY',
      entityId: newCategory.id,
      userId,
      newValue: {
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        isActive: newCategory.isActive,
      },
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
