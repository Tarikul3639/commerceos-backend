import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CloudinaryService } from '../../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

import { UpdateCategoryDto } from '../dto/requests/update-category.dto.js';
import { CategoryResponseDto } from '../dto/responses/category-response.dto.js';

@Injectable()
export class UpdateCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    categoryId: string,
    updateCategoryDto: UpdateCategoryDto,
    userId: string,
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

    const { name, slug, description, image, publicId, isActive } =
      updateCategoryDto;

    if (
      (image !== undefined) !== (publicId !== undefined) ||
      (image === null) !== (publicId === null)
    ) {
      throw new BadRequestException(
        'Category image URL and Cloudinary public ID must be updated or removed together',
      );
    }

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

    const updatedCategory = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.category.update({
        where: { id: categoryId },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(publicId !== undefined && { publicId }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.UPDATE,
          module: ActivityModule.CATEGORY,
          action: 'UPDATE_CATEGORY',
          description: 'Category updated',
          entityType: 'CATEGORY',
          entityId: updated.id,
          userId,
          oldValue: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            publicId: category.publicId,
            isActive: category.isActive,
          },
          newValue: {
            name: updated.name,
            slug: updated.slug,
            description: updated.description,
            image: updated.image,
            publicId: updated.publicId,
            isActive: updated.isActive,
          },
        },
        tx,
      );
      return updated;
    });

    if (
      publicId !== undefined &&
      publicId !== category.publicId &&
      category.publicId
    ) {
      await this.cloudinaryService.delete(category.publicId);
    }

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
