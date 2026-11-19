import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { CreateSizeGuideDto } from '../dto/requests/create-size-guide.dto.js';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto.js';

@Injectable()
export class CreateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /** Create a size guide */
  async execute(
    dto: CreateSizeGuideDto,
    userId: string,
  ): Promise<SizeGuideResponseDto> {
    const existing = await this.prisma.sizeGuide.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Size guide already exists');
    }

    const sizeGuide = await this.prisma.sizeGuide.create({
      data: {
        name: dto.name,
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        unit: dto.unit,
        columns: dto.columns,
        rows: dto.rows,
      },
    });

    // Activity Log Creation
    await this.createActivityLogService.execute({
      type: ActivityType.CREATE,
      module: ActivityModule.OTHER,
      action: 'CREATE_SIZE_GUIDE',
      description: `Size guide "${sizeGuide.name}" was created`,
      entityType: 'SizeGuide',
      entityId: sizeGuide.id,
      userId,
      newValue: {
        name: sizeGuide.name,
        description: sizeGuide.description,
        unit: sizeGuide.unit,
        columns: sizeGuide.columns,
        rows: sizeGuide.rows,
      },
    });

    return sizeGuide as unknown as SizeGuideResponseDto;
  }
}
