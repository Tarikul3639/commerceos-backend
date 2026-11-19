import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { UpdateSizeGuideDto } from '../dto/requests/update-size-guide.dto.js';
import { SizeGuideResponseDto } from '../dto/responses/size-guide-response.dto.js';

@Injectable()
export class UpdateSizeGuideService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  /** Update a size guide */
  async execute(
    id: string,
    dto: UpdateSizeGuideDto,
    userId: string,
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
          columns: dto.columns,
        }),
        ...(dto.rows !== undefined && {
          rows: dto.rows,
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
      userId,
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
