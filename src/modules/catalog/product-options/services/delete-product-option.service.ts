import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../../lib/prisma/client.js';

@Injectable()
export class DeleteProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /**
   * Delete an unused product option without removing variant attributes from order history.
   */
  async execute(
    optionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const option = await tx.productOption.findUnique({
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

      const variantsUsingOption = await tx.productVariant.count({
        where: {
          productId: option.productId,
          options: {
            some: {
              optionId: option.id,
            },
          },
        },
      });

      if (variantsUsingOption > 0) {
        throw new BadRequestException(
          'Product options used by variants cannot be deleted; remove unused variants first or keep the option for historical records',
        );
      }

      await tx.productOption.delete({
        where: { id: option.id },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.PRODUCT,
          action: 'DELETE_PRODUCT_OPTION',
          description: `Product option "${option.name}" was deleted`,
          entityType: 'ProductOption',
          entityId: option.id,
          userId,
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
          newValue: 'Product option permanently deleted',
        },
        tx,
      );

      return { message: 'Product option deleted successfully' };
    });
  }
}
