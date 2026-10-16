
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const oldValue = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      deletedAt: category.deletedAt,
      productCount: category._count.products,
    };

    if (category._count.products > 0) {
      const deletedCategory = await this.prisma.category.update({
        where: { id: categoryId },
        data: { deletedAt: new Date() },
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.CATEGORY,
        action: 'DELETE_CATEGORY',
        description: `Category "${category.name}" was soft deleted`,
        entityType: 'CATEGORY',
        entityId: category.id,
        oldValue,
        newValue: {
          deletedAt: deletedCategory.deletedAt,
        },
      });

      return;
    }

    await this.prisma.category.delete({
      where: { id: categoryId },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.CATEGORY,
      action: 'DELETE_CATEGORY',
      description: `Category "${category.name}" was permanently deleted`,
      entityType: 'CATEGORY',
      entityId: category.id,
      oldValue,
      newValue: "Category permanently deleted",
    });
  }
}
