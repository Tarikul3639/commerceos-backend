import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';
import { CreateSizeGuideDto } from '../dto/requests/create-size-guide.dto';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

@Injectable()
export class CreateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  /** Create a size guide */
  async execute(dto: CreateSizeGuideDto): Promise<SizeGuideResponseDto> {
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
        columns: dto.columns as unknown as Prisma.InputJsonValue,
        rows: dto.rows as unknown as Prisma.InputJsonValue,
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
