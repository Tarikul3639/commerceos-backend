
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';

@Injectable()
export class DeleteBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(brandId: string): Promise<void> {
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

    // Soft delete if the brand has associated products.
    if (brand._count.products > 0) {
      const deletedBrand = await this.prisma.brand.update({
        where: {
          id: brandId,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      await this.createActivityLogService.execute({
        type: ActivityType.DELETE,
        module: ActivityModule.BRAND,
        action: 'DELETE_BRAND',
        description: `Brand "${brand.name}" was soft deleted`,
        entityType: 'BRAND',
        entityId: brand.id,
        oldValue,
        newValue: {
          deletedAt: deletedBrand.deletedAt,
          isActive: deletedBrand.isActive,
        },
      });

      return;
    }

    // Delete the image from Cloudinary before hard delete.
    if (brand.publicId) {
      await this.cloudinaryService.delete(brand.publicId);
    }

    // Hard delete if the brand has no associated products.
    await this.prisma.brand.delete({
      where: {
        id: brandId,
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.BRAND,
      action: 'DELETE_BRAND',
      description: `Brand "${brand.name}" was permanently deleted`,
      entityType: 'BRAND',
      entityId: brand.id,
      oldValue,
      newValue: "Brand permanently deleted",
    });
  }
}
