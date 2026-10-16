import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class RestoreProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  /** Restore a soft-deleted product. */
  async execute(productId: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: { not: null },
      },
      select: {
        id: true,
        name: true,
        subDescription: true,
        description: true,
        purchasePrice: true,
        sellingPrice: true,
        status: true,
        categoryId: true,
        brandId: true,
        sizeGuideId: true,
        deletedAt: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Deleted product not found');
    }

    const restoredProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        deletedAt: null,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.PRODUCT,
      action: 'RESTORE_PRODUCT',
      description: `Product "${product.name}" was restored`,
      entityType: 'Product',
      entityId: product.id,
      oldValue: {
        name: product.name,
        subDescription: product.subDescription,
        description: product.description,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        status: product.status,
        categoryId: product.categoryId,
        brandId: product.brandId,
        sizeGuideId: product.sizeGuideId,
        deletedAt: product.deletedAt,
      },
      newValue: {
        deletedAt: restoredProduct.deletedAt,
      },
    });

    return { message: 'Product restored successfully' };
  }
}
