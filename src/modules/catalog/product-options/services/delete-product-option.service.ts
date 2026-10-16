import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';

@Injectable()
export class DeleteProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  async execute(optionId: string): Promise<{ message: string }> {
    const option = await this.prisma.productOption.findUnique({
      where: { id: optionId },
      include: {
        values: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    await this.prisma.productOption.delete({
      where: { id: option.id },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.DELETE,
      module: ActivityModule.PRODUCT,
      action: 'DELETE_PRODUCT_OPTION',
      description: `Product option "${option.name}" was deleted`,
      entityType: 'ProductOption',
      entityId: option.id,
      oldValue: {
        productId: option.productId,
        name: option.name,
        type: option.type,
        values: option.values.map((value) => ({
          id: value.id,
          value: value.value,
          colorHex: value.colorHex,
        })),
      },
      newValue: "Product option permanently deleted",
    });

    return { message: 'Product option deleted successfully' };
  }
}