import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/enums.js';
import { CreateSizeGuideDto } from '../dto/requests/create-size-guide.dto.js';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto.js';

@Injectable()
export class CreateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(
    dto: CreateSizeGuideDto,
    userId: string,
  ): Promise<SizeGuideResponseDto> {
    const sizeGuide = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.sizeGuide.findFirst({
        where: { name: { equals: dto.name, mode: 'insensitive' } },
        select: { id: true },
      });
      if (existing) throw new ConflictException('Size guide already exists');

      const created = await tx.sizeGuide.create({
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
      await this.createActivityLogService.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.OTHER,
          action: 'CREATE_SIZE_GUIDE',
          description: `Size guide "${created.name}" was created`,
          entityType: 'SizeGuide',
          entityId: created.id,
          userId,
          newValue: {
            name: created.name,
            description: created.description,
            unit: created.unit,
            columns: created.columns,
            rows: created.rows,
          },
        },
        tx,
      );
      return created;
    });
    return sizeGuide as unknown as SizeGuideResponseDto;
  }
}
