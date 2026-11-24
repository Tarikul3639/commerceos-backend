import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../../infrastructure/database/generated/prisma/client.js';

@Injectable()
export class DeleteProductOptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    optionId: string,
    userId: string,
  ): Promise<{ message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const option = await tx.productOption.findUnique({
        where: { id: optionId },
      });
      if (!option) throw new NotFoundException('Product option not found');

      const variants = await tx.productVariant.findMany({
        where: { productId: option.productId, deletedAt: null },
        select: { options: true },
      });
      const isUsed = variants.some(
        (variant) =>
          (variant.options as Record<string, string>)[option.id] !== undefined,
      );
      if (isUsed) {
        throw new BadRequestException(
          'This option is used by existing variants. Remove those variants before deleting the option.',
        );
      }

      await tx.productOption.delete({ where: { id: option.id } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.PRODUCT,
          action: 'DELETE_PRODUCT_OPTION',
          description: `Product option "${option.name}" was deleted`,
          entityType: 'ProductOption',
          entityId: option.id,
          userId,
          oldValue: option,
          newValue: 'Product option permanently deleted',
        },
        tx,
      );

      return { message: 'Product option deleted successfully' };
    });
  }
}
