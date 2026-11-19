import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../infrastructure/database/generated/prisma/client.js';
import { CloudinaryService } from '../../../../infrastructure/storage/cloudinary/services/cloudinary.service.js';

@Injectable()
export class DeleteBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(brandId: string, userId: string): Promise<void> {
    const brand = await this.prisma.brand.findFirst({
      where: {
        id: brandId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const oldValue = {
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      image: brand.image,
      publicId: brand.publicId,
      isActive: brand.isActive,
      deletedAt: brand.deletedAt,
      productCount: brand._count.products,
    };

    const hasProducts = brand._count.products > 0;
    await this.prisma.$transaction(async (tx) => {
      if (hasProducts) {
        const deletedBrand = await tx.brand.update({
          where: { id: brandId },
          data: { deletedAt: new Date(), isActive: false },
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.DELETE,
            module: ActivityModule.BRAND,
            action: 'DELETE_BRAND',
            description: 'Brand soft deleted',
            entityType: 'BRAND',
            entityId: brand.id,
            userId,
            oldValue,
            newValue: {
              deletedAt: deletedBrand.deletedAt,
              isActive: deletedBrand.isActive,
            },
          },
          tx,
        );
        return;
      }

      await tx.brand.delete({ where: { id: brandId } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.BRAND,
          action: 'DELETE_BRAND',
          description: 'Brand permanently deleted',
          entityType: 'BRAND',
          entityId: brand.id,
          userId,
          oldValue,
          newValue: 'Brand permanently deleted',
        },
        tx,
      );
    });

    // External asset cleanup happens only after the database delete commits.
    if (!hasProducts && brand.publicId) {
      await this.cloudinaryService.delete(brand.publicId);
    }
  }
}
