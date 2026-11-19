import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/enums.js';

@Injectable()
export class DeleteSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(id: string, userId: string): Promise<{ message: string }> {
    await this.prisma.$transaction(async (tx) => {
      const sizeGuide = await tx.sizeGuide.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          unit: true,
          columns: true,
          rows: true,
          _count: { select: { products: true } },
        },
      });
      if (!sizeGuide) throw new NotFoundException('Size guide not found');
      if (sizeGuide._count.products > 0) {
        throw new ConflictException(
          'Cannot delete a size guide assigned to products',
        );
      }

      await tx.sizeGuide.delete({ where: { id } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.OTHER,
          action: 'DELETE_SIZE_GUIDE',
          description: `Size guide "${sizeGuide.name}" was deleted`,
          entityType: 'SizeGuide',
          entityId: sizeGuide.id,
          userId,
          oldValue: {
            name: sizeGuide.name,
            description: sizeGuide.description,
            unit: sizeGuide.unit,
            columns: sizeGuide.columns,
            rows: sizeGuide.rows,
          },
        },
        tx,
      );
    });
    return { message: 'Size guide deleted successfully' };
  }
}
