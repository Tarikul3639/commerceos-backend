import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@/lib/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateActivityLogService } from '@/modules/activity-logs/services/create-activity-log.service';
import { ActivityModule, ActivityType } from '@/lib/prisma/client';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto';

@Injectable()
export class UpdateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) { }

  /** Update a size guide */
  async execute(
    id: string,
    dto: UpdateSizeGuideDto,
  ): Promise<SizeGuideResponseDto> {
    const existing = await this.prisma.sizeGuide.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        unit: true,
        columns: true,
        rows: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Size guide not found');
    }

    if (dto.name !== undefined) {
      const duplicate = await this.prisma.sizeGuide.findFirst({
        where: {
          name: { equals: dto.name, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException('Size guide already exists');
      }
    }

    const sizeGuide = await this.prisma.sizeGuide.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.columns !== undefined && {
          columns: dto.columns as unknown as Prisma.InputJsonValue,
        }),
        ...(dto.rows !== undefined && {
          rows: dto.rows as unknown as Prisma.InputJsonValue,
        }),
      },
    });

    await this.createActivityLogService.execute({
      type: ActivityType.UPDATE,
      module: ActivityModule.OTHER,
      action: 'UPDATE_SIZE_GUIDE',
      description: `Size guide "${existing.name}" was updated`,
      entityType: 'SizeGuide',
      entityId: sizeGuide.id,
      oldValue: {
        name: existing.name,
        description: existing.description,
        unit: existing.unit,
        columns: existing.columns,
        rows: existing.rows,
      },
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
