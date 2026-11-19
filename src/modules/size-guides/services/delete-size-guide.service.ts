import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';

@Injectable()
export class DeleteSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /** Delete an unused size guide */
  async execute(id: string, userId: string): Promise<{ message: string }> {
    const sizeGuide = await this.prisma.sizeGuide.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        unit: true,
        columns: true,
        rows: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!sizeGuide) {
      throw new NotFoundException('Size guide not found');
    }

    if (sizeGuide._count.products > 0) {
      throw new ConflictException(
        'Cannot delete a size guide assigned to products',
      );
    }

    await this.prisma.sizeGuide.delete({
      where: { id },
    });

    await this.createActivityLogService.execute({
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
      newValue: '',
    });

    return { message: 'Size guide deleted successfully' };
  }
}
