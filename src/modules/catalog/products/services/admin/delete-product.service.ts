import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class DeleteProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(productId: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
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
      throw new NotFoundException('Product not found');
    }

    const deletedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.PRODUCT,
      action: 'DELETE_PRODUCT',
      description: `Product "${product.name}" was deleted`,
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
        deletedAt: deletedProduct.deletedAt,
      },
    });
    return { message: 'Product deleted successfully' };
  }
}
