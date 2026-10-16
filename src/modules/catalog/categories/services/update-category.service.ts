import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { UpdateCategoryDto } from '../dto/requests/update-category.dto';
import { CategoryResponseDto } from '../dto/responses/category-response.dto';

@Injectable()
export class UpdateCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { name, slug, description, isActive } = updateCategoryDto;

    if (name !== undefined && name !== category.name) {
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          name,
        },

        select: {
          id: true,
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    if (slug !== undefined && slug !== category.slug) {
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          slug,
        },

        select: {
          id: true,
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category slug already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
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

        ...(isActive !== undefined && {
          isActive,
        }),
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.CATEGORY,
      action: 'UPDATE_CATEGORY',
      description: `Category "${updatedCategory.name}" was updated`,
      entityType: 'CATEGORY',
      entityId: updatedCategory.id,
      oldValue: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: category.isActive,
      },
      newValue: {
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        isActive: updatedCategory.isActive,
      },
    });

    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      slug: updatedCategory.slug,
      description: updatedCategory.description,
      isActive: updatedCategory.isActive,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
    };
  }
}
